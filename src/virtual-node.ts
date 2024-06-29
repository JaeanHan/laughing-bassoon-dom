// TODO : 간단하게라도 구현 자체가 완료 되면 파일 나누기
export const keyAttributeMap = new Map<string, string[]>();
export const keyVirtualNodeMap = new Map<string, VirtualNode | VirtualTextNode>();
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
    children: string[]

}

export interface VirtualNode extends JNode{
    props: { [key: string]: any } | null
}

export interface VirtualTextNode extends JNode {
    // children: string[]
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

function virtualNode(type: VirtualNodeType, nodeKey: string, props=null, children: string[]): VirtualNode {
    return {
        type : type,
        key : nodeKey,
        props : props,
        children : children,
    }
}

const secretKey = 'v';

function initTreeKeyNamespace() : () => IKeyFunction<number> {
    let v = 0;
    return function (): IKeyFunction<number> {
        // v++;
        return function (key: number): string {
            return `${secretKey}${v}-${key}`;
        }
    }
}

const initTreeKey: () => IKeyFunction<number> = initTreeKeyNamespace();

function stringToVirtualTextNode(key: string, string: string): VirtualTextNode {
    return {
        type : VirtualNodeType.Text,
        key: key,
        children : [string]
    };
}


// export function initVirtualTree(): (type: VirtualNodeType, props: any, ...children: any) => (VirtualNode | VirtualTextNode) {
export function initVirtualTree(): any {
    let idx = 0
    const createNodeKey = initTreeKey();
    function extractNodeKeys(children: (string | JNode)[]) {
        return children.map((child: string | JNode) => {
            if (typeof child === "string") {
                if (!child.startsWith(secretKey)) {
                    const vTextNode = stringToVirtualTextNode(createNodeKey(idx++), child);
                    keyVirtualNodeMap.set(vTextNode.key, vTextNode);

                    return vTextNode.key;
                }
                return child;
            }
            return child.key
        });
    }
    // TODO : key 할당을 생성 순이 아니라 돔트리 다 만들고 할당. 키: (depth, props) => Hash(depth, props)?
    return function createVirtualNode(type: VirtualNodeType, props: any, ...children: any): (VirtualNode | VirtualTextNode) {
        const nodeKey = createNodeKey(idx++);
        const vNode = virtualNode(type, nodeKey, props, extractNodeKeys(children));
        keyVirtualNodeMap.set(nodeKey, vNode);

        return vNode;
    };
}

// export function recreateElement(key:string, props:any, ...children: any) {
//     const vNode = keyVirtualNodeMap.get(key);
//     if (isInstanceOfVirtualTextNode(vNode)) {
//
//     }
//     children.forEach
//     return
//
// }

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

    children.forEach(childKey => {
        const childVNode = keyVirtualNodeMap.get(childKey) as JNode;
        if (childVNode) {
            const childElement = createElement(childVNode);
            if (childElement) {
                element.appendChild(childElement);
            }
        }
    });

    return element;
}

export function diff(previousRoot: VirtualNode | VirtualTextNode, latestRoot: VirtualNode | VirtualTextNode, parentKey="root"): PatchCommand[] {
    const diffs: PatchCommand[] = [];
    if ( previousRoot.type !== latestRoot.type
        || previousRoot.key !== latestRoot.key
        // || previousRoot.props !== latestRoot.props
    ) {
        console.log(previousRoot, latestRoot);
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

    const pRoot:VirtualNode = previousRoot;
    const lRoot:VirtualNode = latestRoot;
    const prevChildrenKeys = pRoot.children;
    const lateChildrenKeys = lRoot.children;
    const prevLen = prevChildrenKeys.length;
    const lateLen = lateChildrenKeys.length;

    const prevChildren = prevChildrenKeys.map(childKey => keyVirtualNodeMap.get(childKey));
    const lateChildren = lateChildrenKeys.map(childKey => keyVirtualNodeMap.get(childKey));

    // 하단 트리 구조가 다름
    if (prevLen !== lateLen) {
        if (prevLen < lateLen) {
            const prevKeys = new Set(prevChildrenKeys);
            lateChildrenKeys
                .filter(key => !prevKeys.has(key))
                .forEach(newKey => diffs.push({
                    type: PatchCommandType.Append,
                    parentKey : lRoot.key,
                    prevKey : null,
                    lateKey : newKey
                }));

            return diffs;
        }

        if (prevLen > lateLen) {
            const lateKeys = new Set(lateChildrenKeys);
            prevChildrenKeys
                .filter(key => !lateKeys.has(key))
                .forEach(removedKey => diffs.push({
                    type: PatchCommandType.Remove,
                    parentKey : pRoot.key,
                    prevKey : removedKey,
                    lateKey : null
                }));

            return diffs;
        }
    }
    // 같음
    if (pRoot.key !== lRoot.key) {
        alert(`???? ${pRoot.key}, ${lRoot.key}`);
    }

    for (let i = 0; i < lateLen; i++) {
        diffs.push(...diff(prevChildren[i] as VirtualNode, lateChildren[i] as VirtualNode, lRoot.key));
    }

    return diffs;
}

export function patch(patches: PatchCommand[]) {
    console.log('patch', patches);
    patches.forEach((patch) => {
        const parentEl = keyElementMap.get(patch.parentKey);
        if (!parentEl) {
            console.warn('this really should never happen', patch.parentKey);
            return;
        }

        if (patch.type === PatchCommandType.Append) {
            const vChild = keyVirtualNodeMap.get(patch.lateKey as string);
            if (!vChild) {
                console.warn('vChild not found!', vChild);
                return;
            }

            const child = document.createElement(vChild.type);
            const grandChildrenKeys = vChild.children;

            grandChildrenKeys.forEach(grandChildKey => {
                const vGrandChildren = keyVirtualNodeMap.get(grandChildKey);
                if (vGrandChildren) {
                    const childBranch = createElement(vGrandChildren);
                    if (childBranch) {
                        child.appendChild(childBranch);
                    }
                }
            })

            parentEl.appendChild(child);
        }
    });
}

