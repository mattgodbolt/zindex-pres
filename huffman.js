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
            leaf: !this.children,
            backref: this.token && this.token.length > 1,
            root: this.name === ""
        }
    }
}

class Tree {
    constructor(root) {
        this.root = root;
        this.tokenToSymbol = {};
        this.root.enname(this.tokenToSymbol, "");
        if (!this.root.children)
            this.root.name = "0";
        else this.root.name = "";
    }

    toDag() {
        return this.root.toDag();
    }

    compress(tokens) {
        return (tokens.map(x => this.tokenToSymbol[x])).join(" ");
    }

    numSymbols() {
        return Object.keys(this.tokenToSymbol).length;
    }
}

function toNodes(tokens) {
    const nodes = {};
    for (const token of tokens) {
        if (!nodes[token]) {
            nodes[token] = new Node(1, token, null);
        } else {
            nodes[token].count++;
        }
    }
    return Object.values(nodes);
}

export function makeTree(tokens) {
    let nodes = toNodes(tokens);
    if (nodes.length === 0)
        return new Tree(new Node(0, '', null));
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