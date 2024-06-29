import {createElement, diff, initVirtualTree, patch, VirtualNode} from "./virtual-node";

const world = 'World';

export function hello(word: string = world): string {
    return `Hello ${word}`;
}

const root = document.getElementById("root");
const createVirtualNode = initVirtualTree();
let previousTree;

if (root) {
    const rootNode = createVirtualNode(
        "div", null, hello("root"),
        createVirtualNode("div", null, "hi", ` div1`),
        createVirtualNode("div", null, "11", createVirtualNode("div", null, "22", createVirtualNode("div", null, "33"))),
    );
    let rootNodeV1: VirtualNode | object;
    let rootNodeV2: VirtualNode | object;

    // first mount
    setTimeout(() => {
        rootNodeV1 = structuredClone(rootNode);
        console.log('v1', rootNode);
        root.appendChild(createElement(rootNode));
        previousTree = rootNode;

        // dom 추가
        setTimeout(() => {
            const createVirtualNode2 = initVirtualTree();
            const rootNode = createVirtualNode2(
                "div", null, hello("root"),
                createVirtualNode2("div", null, "hi", ` div1`, createVirtualNode2("div", null, hello("root"))),
                createVirtualNode2("div", null, "11", createVirtualNode2("div", null, "22", createVirtualNode2("div", null, "33"))),
            );

            rootNodeV2 = structuredClone(rootNode);
            console.log('v2', rootNodeV2);
            const patches = diff(rootNodeV1 as VirtualNode, rootNodeV2 as VirtualNode);
            patch(patches);

        }, 2000);
    }, 2000);

} else {
    console.log('null');
}
