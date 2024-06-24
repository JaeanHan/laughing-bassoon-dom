import {createElement, VirtualNode, VirtualNodeType} from "./virtual-node";

const world = 'World';

export function hello(word: string = world): string {
    return `Hello ${word}`;
}

console.log(hello());

const rootNode: VirtualNode = {
    type: VirtualNodeType.Div,
    attributes: {},
    props: { },
    key: 'k0',
    children: []
};

for (let i = 1; i < 5; i++) {
    if (i % 2 == 0) {
        rootNode.children.push({
            type: VirtualNodeType.Div,
            attributes: {},
            props: {},
            key: `k${i}`,
            children: []
        })
    } else {
        rootNode.children.push({
            type: VirtualNodeType.Text,
            attributes: { },
            props: { },
            key: `k${i}`,
            children: [],
            textContent: `text k${i}`
        })
    }
}

const root = document.getElementById("root");

if (root) {
    console.log(root.attributes);
    rootNode.attributes = Object.assign(
        {},
        ...Array.from(root.attributes, ({name, value}) => ({[name]: value})) as any
    );

    setTimeout(() => {
        root.replaceWith(createElement(rootNode));
    }, 3000);
} else {
    console.log('null');
}
