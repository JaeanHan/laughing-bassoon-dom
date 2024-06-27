import {createElement, diff, initVirtualTree, patch, VirtualNode, VirtualTextNode} from "./virtual-node";

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
    let rootNodeV1: VirtualNode | object;
    let rootNodeV2: VirtualNode | object;

    // first mount
    setTimeout(() => {
        for (let i = 1; i < 5; i++) {
            const [textKey, createTextTemplate] = createTypeTemplate("text");
            const text = createTextTemplate(null, `text k${i}`);

            const [divKey, creatDiv] = createTypeTemplate("div");
            const wrapper = creatDiv(null, text);
            rootNode = createRootNode(null, ...rootNode.children, wrapper);
        }
        rootNodeV1 = structuredClone(rootNode);
        console.log('v1', rootNodeV1);
        root.appendChild(createElement(rootNode));
        previousTree = rootNode;

        // append
        setTimeout(() => {
            for (let i = 1; i < 5; i++) {
                const [textKey, createTextTemplate] = createTypeTemplate("text");
                const text = createTextTemplate(null, `text2 k${i}`);

                const [divKey, creatDiv] = createTypeTemplate("div");
                const wrapper = creatDiv(null, text);
                rootNode = createRootNode(null, ...rootNode.children, wrapper);
            }

            rootNodeV2 = structuredClone(rootNode);
            console.log('v2', rootNodeV2);
            const patches = diff(rootNodeV1 as VirtualNode, rootNodeV2 as VirtualNode);
            patch(patches);

        }, 2000);
    }, 2000);

} else {
    console.log('null');
}
