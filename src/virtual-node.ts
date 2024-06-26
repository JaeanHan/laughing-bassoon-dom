export const VirtualNodeType = {
    Div: "div",
    Text: "text",
};
type VirtualNodeType = typeof VirtualNodeType[keyof typeof VirtualNodeType];

const PatchCommand = {
    Append: 'append',
    Replace: "replace",
    Remove: "remove"
};
type PatchCommandType = typeof PatchCommand[keyof typeof PatchCommand];

interface PatchCommand {
    type: PatchCommandType
    prevKey: string
    lateKey: string
}

export interface ITemplateFunction<ValueType>
{
    (props: { [key: string]: any } | null, ...args: any): ValueType;
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
    textContent : string
}

export function isInstanceOfVirtualNode(node: JNode): node is VirtualNode {
    return node.type === VirtualNodeType.Div;
}

export function isInstanceOfVirtualTextNode(node: JNode): node is VirtualTextNode {
    return node.type === VirtualNodeType.Text
}

function createNodeKey(key: number): string {
    return `k${key}`;
}

function stringToVirtualTextNode(key: number, string: string): VirtualTextNode {
    return {
        type : VirtualNodeType.Text,
        key: createNodeKey(key),
        textContent : string
    };
}

function virtualTextNode(nodeKey: string, children: string|string[]): VirtualTextNode {
    if (Array.isArray(children)) {
        return {
            type: VirtualNodeType.Text,
            key : nodeKey,
            textContent : children.join("\n"),
        }
    }
    return {
        type: VirtualNodeType.Text,
        key : nodeKey,
        textContent : children,
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

// TODO: 일단 분리해 놨는데 특별히 이유가 안 생기면 합치기
export function initVirtualTree(): any {
    let key = 0;
    return function createTypeTemplate(type: VirtualNodeType): [string, ITemplateFunction<VirtualNode | VirtualTextNode>] {
        const nodeKey = createNodeKey(key++);
        const wrapRawString = (children: any[]): JNode[] => // string or JNode
            children.map(child => (typeof child === "string"
                ? stringToVirtualTextNode(key++, child)
                : child)
        );

        return [
            nodeKey,
            //TODO: Type '{ [key: string]: any; } | null' is not assignable to type 'null' ??
            function createVirtualNode(props: any , ...children: any): VirtualNode | VirtualTextNode {
                if (type === VirtualNodeType.Text) {
                    return virtualTextNode(nodeKey, children);
                }

                return virtualNode(type, nodeKey, props, wrapRawString(children));
            }
        ];
    }
}

export const keyElementMap = new Map<string, HTMLElement>();
export const keyAttributeMap = new Map<string, string[]>();

export function createElement(vNode: JNode): HTMLElement | Text {
    if (isInstanceOfVirtualTextNode(vNode)) {
        return document.createTextNode(vNode?.textContent ?? "\n");
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

export function diff(previousRoot: VirtualNode, latestRoot: VirtualNode) {
    const diff: PatchCommand[] = [];
    if ( previousRoot.type !== latestRoot.type
        || previousRoot.key !== latestRoot.key
        // || previousRoot.props !== latestRoot.props
    ) {
        return [{
            type : PatchCommand.Replace,
            parentKey : "root",
            prevKey : previousRoot.key,
            lateKey : latestRoot.key
        }];
    }

    const prevChildren = previousRoot.children;
    const lateChildren = latestRoot.children;




    return diff;
}

function diffChildren(previousNode: VirtualNode, latestNode: VirtualNode): PatchCommand | null {
    if (
        previousNode.type !== latestNode.type
        || previousNode.key !== latestNode.key
    ) {
        return {
            type : PatchCommand.Replace,
            prevKey : previousNode.key,
            lateKey : latestNode.key
        }
    }
    return {
        type : PatchCommand.Replace,
        prevKey : previousNode.key,
        lateKey : latestNode.key
    }
    // const prevChildren = previousNode.children;
    // const lateChildren = latestNode.children;
    // if (prevChildren.length === lateChildren.length) {
    //     for (let i = 0; i < prevChildren.length; i++) {
    //         const result = diffChildren(prevChildren[i], lateChildren[i]);
    //         if (result) {
    //             diff.push(result);
    //         }
    //     }
    // }
}