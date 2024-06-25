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

// export interface VirtualTextNode {
//     type: VirtualNodeType
//     key: string,
//     textContent : string
// }

export interface VirtualNode {
    type: VirtualNodeType
    key: string,
    props: { [key: string]: any } | null
    children: VirtualNode[]
}

export function initVirtualTree(): any  {
    let key = 0;
    return function createTypeTemplate(type: VirtualNodeType): any {
        const nodeKey = `k${key++}`;
        //TODO : args
        return function createVirtualNode (props = null, children = []): VirtualNode {
            if (type === VirtualNodeType.Text) {
                return {
                    type: type,
                    key : nodeKey,
                    children : children,
                    props : null
                }
            }
            if (!Array.isArray(children)) {
                children = [children];
            }

            return {
                type : type,
                key : nodeKey,
                props : props,
                children : children.map(child => {
                    return typeof child === "string" ? {
                        type : VirtualNodeType.Text,
                        key : `k${key++}`,
                        props : null,
                        children : child
                    } : child;
                }),
            }
        }
    }
}

export const keyElementMap = new Map<string, HTMLElement>();
export const keyAttributeMap = new Map<string, string[]>();

export function createElement(vNode: VirtualNode): HTMLElement | Text {
    const { type, key, props, children = [] } = vNode;
    if (type === VirtualNodeType.Text) {
        if (!Array.isArray(children)) {
            return document.createTextNode(children?? "");
        }
        else {
            console.log("how could node type text children not be string", children);
        }
    }

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

    // const prevChildren = previousRoot.children;
    // const lateChildren = latestRoot.children;
    // if (prevChildren.length === lateChildren.length) {
    //     for (let i = 0; i < prevChildren.length; i++) {
    //         const result = diffChildren(prevChildren[i], lateChildren[i]);
    //         if (result) {
    //             diff.push(result);
    //         }
    //     }
    // }

    // const minLength = Math.min(previousRoot.children.length, latestRoot.children.length);
    // const maxLength = Math.max(previousRoot.children.length, latestRoot.children.length);

    // for (let i = 0; i < minLength; i++) {
    //     const result = diffChildren(prevChildren[i], lateChildren[i]);
    //     if (result) {
    //         diff.push(result);
    //     }
    // }

    // for (let i = minLength; i < maxLength; i++) {
    //     if (prevChildren.length === minLength) {
    //         diff.push({
    //             type: PatchCommand.Append,
    //             prevKey: "",
    //             lateKey: lateChildren[i].key
    //         });
    //     }
    //     diff.push({
    //         type: PatchCommand.Remove,
    //         prevKey: prevChildren[i].key,
    //         lateKey: "",
    //     });
    // }

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