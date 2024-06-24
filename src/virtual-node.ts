export const VirtualNodeType = {
    Div: "div",
    Text: "text",
}

type VirtualNodeType = typeof VirtualNodeType[keyof typeof VirtualNodeType]

export interface VirtualNode {
    type: VirtualNodeType
    key: string,
    props: { [key: string]: any }
    attributes: { [key: string]: any }
    children: VirtualNode[]
    textContent ?: string
}

export function createElement(vNode: VirtualNode): HTMLElement | Text {
    const { type, key, props, textContent, attributes, children } = vNode;

    if (type === VirtualNodeType.Text) {
        return document.createTextNode(textContent ?? "");
    }

    const element = document.createElement(type);

    Object.entries(attributes).forEach(([attr, value]) => element.setAttribute(attr, value));

    if (children) {
        children
            .map(child => createElement(child))
            .forEach(child => element.appendChild(child));
    }

    console.dir(element);
    return element;
}