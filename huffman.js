class Node {
    constructor(count, token, children) {
        this.count = count;
        this.token = token;
        this.children = children;
        this.name = null;
    }

    enname(map, prefix) {
        this.name = prefix;
        if (this.children) {
            this.children[0].enname(map, prefix + '0');
            this.children[1].enname(map, prefix + '1');
        } else {
            map[this.token] = this.name;
        }
    }

    describe() {
        if (this.children)
            return `${this.count}`;
        return `'${this.token}' (${this.count})`;
    }

    toDag() {
        return {
            token: this.token === ' ' ? "' '" : this.token,
            id: this.name,
            children: this.children ? this.children.map(child => child.toDag()).reverse() : [],
            leaf: !this.children
        }
    }
}

class Tree {
    constructor(root) {
        this.root = root;
        this.codeToSymbol = {};
        this.root.enname(this.codeToSymbol, "");
        if (!this.root.children)
            this.root.name = "0";
    }

    toDag() {
        return this.root.toDag();
    }

    compress(text) {
        return (text.split('').map(x => this.codeToSymbol[x])).join(" ");
    }

    numSymbols() {
        return Object.keys(this.codeToSymbol).length;
    }
}

function stringToNodes(text) {
    const nodes = {};
    for (const char of text) {
        if (!nodes[char]) {
            nodes[char] = new Node(1, char, null);
        } else {
            nodes[char].count++;
        }
    }
    return Object.values(nodes);
}

export function makeTree(text) {
    let nodes = stringToNodes(text);
    while (nodes.length > 1) {
        nodes = nodes.sort((x, y) => x.count - y.count);
        const leftChild = nodes.shift()
        const rightChild = nodes.shift();
        const totalCount = leftChild.count + rightChild.count;
        console.log(`Combining ${leftChild.describe()} and ${rightChild.describe()} to make a new node with ${totalCount}`);
        const newNode = new Node(totalCount, null, [leftChild, rightChild]);
        nodes.unshift(newNode);
    }
    return new Tree(nodes[0]);
}