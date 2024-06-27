// TODO : 간단하게라도 구현 자체가 완료 되면 파일 나누기
export const keyAttributeMap = new Map<string, string[]>();
export const keyVirtualNodeMap = new Map<string, VirtualNode>();
export const keyElementMap = new Map<string, HTMLElement>();

export const VirtualNodeType = {
    Div: "div",
    Text: "text",
};
type VirtualNodeType = typeof VirtualNodeType[keyof typeof VirtualNodeType];

const PatchCommandType = {
    Append: 'append',
    Replace: "replace",
    Remove: "remove"
};
type PatchCommandType = typeof PatchCommandType[keyof typeof PatchCommandType];

interface PatchCommand {
    type: PatchCommandType
    parentKey: string
    prevKey: string | null
    lateKey: string | null
}

export interface ITemplateFunction<ValueType>
{
    (props: { [key: string]: any } | null, ...args: any): ValueType;
}

export interface IKeyFunction<ValueType>
{
    (key: ValueType): string;
}

export interface JNode {
    type: VirtualNodeType
    key: string,
}

export interface VirtualNode extends JNode{
    props: { [key: string]: any } | null
    children: JNode[]
}

export interface VirtualTextNode extends JNode {
     children: string[]
}

export function isInstanceOfVirtualNode(node: JNode): node is VirtualNode {
    return node.type === VirtualNodeType.Div;
}

export function isInstanceOfVirtualTextNode(node: JNode): node is VirtualTextNode {
    return node.type === VirtualNodeType.Text
}

function virtualTextNode(nodeKey: string, children: string|string[]): VirtualTextNode {
    return {
        type: VirtualNodeType.Text,
        key : nodeKey,
        children : Array.isArray(children)? children : [children],
    }
}

function virtualNode(type: VirtualNodeType, nodeKey: string, props=null, children: JNode[]): VirtualNode {
    return {
        type : type,
        key : nodeKey,
        props : props,
        children : children,
    }
}

function stringToVirtualTextNode(createNodeKey: IKeyFunction<number>, key: number, string: string): VirtualTextNode {
    return {
        type : VirtualNodeType.Text,
        key: createNodeKey(key),
        children : [string]
    };
}

function initTreeKeyNamespace() : () => IKeyFunction<number> {
    let v = 0;
    return function (): IKeyFunction<number> {
        v++;
        return function (key: number): string {
            return `v${v}-${key}`;
        }
    }
}

const initTreeKey: () => IKeyFunction<number> = initTreeKeyNamespace();

export function initVirtualTree(): any {
    let idx = 0
    const createNodeKey = initTreeKey();
    console.log('??');
    // TODO: 일단 분리해 놨는데 특별히 이유가 안 생기면 합치기
    return function createTypeTemplate(type: VirtualNodeType): [string, ITemplateFunction<VirtualNode | VirtualTextNode>] {
        const nodeKey = createNodeKey(idx++);
        const wrapRawString = (children: any[]): JNode[] => // string or JNode
            children.map(child => (typeof child === "string"
                ? stringToVirtualTextNode(createNodeKey, idx++, child)
                : child)
        );

        return [
            nodeKey,
            //TODO: Type '{ [key: string]: any; } | null' is not assignable to type 'null' ??
            function createVirtualNode(props: any , ...children: any): VirtualNode | VirtualTextNode {
                if (type === VirtualNodeType.Text) {
                    return virtualTextNode(nodeKey, children);
                }
                const vNode = virtualNode(type, nodeKey, props, wrapRawString(children));
                // children nested 안되게 하고 싶은데 children.map(child => child.key)
                keyVirtualNodeMap.set(nodeKey, vNode);
                console.log(vNode);

                return vNode;
            }
        ];
    }
}

export function createElement(vNode: JNode): HTMLElement | DocumentFragment {
    if (isInstanceOfVirtualTextNode(vNode)) {
        const documentFragment = document.createDocumentFragment();
        vNode.children.forEach(text => {
            const textNode = document.createTextNode(text ?? "\n");
            documentFragment.appendChild(textNode);
        })

        return documentFragment;
    }
    const { type, key, props, children = [] } = vNode as VirtualNode;

    const element = document.createElement(type);

    keyElementMap.set(key, element);
    // Object
    //     .entries(keyAttributeMap.get(key))
    //     .forEach(([attr, value]) => element.setAttribute(attr, value));

    if (children) {
        children
            .map(child => {
                const childEl = createElement(child);
                if (child.type !== VirtualNodeType.Text) {
                    keyElementMap.set(child.key, childEl as HTMLElement);
                }
                return childEl;
            })
            .forEach(child => element.appendChild(child));
    }

    return element;
}

export function diff(previousRoot: VirtualNode | VirtualTextNode, latestRoot: VirtualNode | VirtualTextNode, parentKey="root"): PatchCommand[] {
    const diffs: PatchCommand[] = [];
    if ( previousRoot.type !== latestRoot.type
        || previousRoot.key !== latestRoot.key
        // || previousRoot.props !== latestRoot.props
    ) {
        diffs.push({
            type : PatchCommandType.Replace,
            parentKey : parentKey,
            prevKey : previousRoot.key,
            lateKey : latestRoot.key
        } as PatchCommand);

        return diffs;
    }

    if (isInstanceOfVirtualTextNode(previousRoot) || isInstanceOfVirtualTextNode(latestRoot)) {
        // to be implemented. . .
        return diffs;
    }

    const prevChildren = previousRoot.children;
    const lateChildren = latestRoot.children;
    const prevLen = prevChildren.length;
    const lateLen = lateChildren.length;

    // 하단 트리 구조가 다름
    if (prevLen !== lateLen) {
        const prevKeys = prevChildren.map(child => child.key);
        const lateKeys = lateChildren.map(child => child.key);

        if (prevLen < lateLen) {
            const prevKeys = new Set(prevChildren.map(child => child.key));
            lateKeys
                .filter(key => !prevKeys.has(key))
                .forEach(newKey => diffs.push({
                    type: PatchCommandType.Append,
                    parentKey : latestRoot.key,
                    prevKey : null,
                    lateKey : newKey
                }));

            return diffs;
        }

        if (prevLen > lateLen) {
            const lateKeys = new Set(lateChildren.map(child => child.key));
            prevKeys
                .filter(key => !lateKeys.has(key))
                .forEach(removedKey => diffs.push({
                    type: PatchCommandType.Remove,
                    parentKey : previousRoot.key,
                    prevKey : removedKey,
                    lateKey : null
                }));

            return diffs;
        }
    }
    // 같음
    if (previousRoot.key !== latestRoot.key) {
        alert(`???? ${previousRoot.key}, ${latestRoot.key}`);
    }

    for (let i = 0; i < lateLen; i++) {
        diffs.push(...diff(prevChildren[i] as VirtualNode, lateChildren[i] as VirtualNode, latestRoot.key));
    }

    return diffs;
}

export function patch(patches: PatchCommand[]) {
    console.log('patch', patches);
    const documentFragment = document.createDocumentFragment();
    patches.forEach((patch) => {
        const parentEl = keyElementMap.get(patch.parentKey);

        if (patch.type === PatchCommandType.Append) {
            const parent = keyVirtualNodeMap.get(patch.parentKey);
            // const vChild = keyVirtualNodeMap.get(patch.lateKey as string);
            // const child = document.createElement(vChild.type);

            // for (let i = 0; i < )


        }
    });

}