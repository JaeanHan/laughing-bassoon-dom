import { createElement, initVirtualTree } from "./virtual-node";

const world = 'World';

export function hello(word: string = world): string {
    return `Hello ${word}`;
}

const root = document.getElementById("root");
const createTypeTemplate = initVirtualTree();
let previousTree;

if (root) {
    const [key, createRootNode] = createTypeTemplate("div");
    let rootNode = createRootNode(null, hello("root"));

    // first mount
    setTimeout(() => {
        for (let i = 1; i < 5; i++) {
            const [textKey, createTextTemplate] = createTypeTemplate("text");
            const text = createTextTemplate(null, `text k${i}`);

            const [divKey, creatDiv] = createTypeTemplate("div");
            const wrapper = creatDiv(null, text);
            rootNode = createRootNode(null, ...rootNode.children, wrapper);
        }
        root.appendChild(createElement(rootNode));
        previousTree = rootNode;
    }, 2000);

} else {
    console.log('null');
}
