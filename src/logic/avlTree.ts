import { GameNode, CrimeType } from '../types/game';

export class AVLTree {
  static getHeight(node: GameNode | null): number {
    return node ? node.height : 0;
  }

  static getBalance(node: GameNode | null): number {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  static updateHeight(node: GameNode): void {
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }

  static rotateRight(y: GameNode): GameNode {
    const x = y.left!;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    this.updateHeight(y);
    this.updateHeight(x);

    return x;
  }

  static rotateLeft(x: GameNode): GameNode {
    const y = x.right!;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    this.updateHeight(x);
    this.updateHeight(y);

    return y;
  }

  static insert(node: GameNode | null, id: string, evidenceId: string, crimeType: CrimeType, gravity: number): GameNode {
    if (!node) {
      return {
        id,
        evidenceId,
        crimeType,
        gravity,
        left: null,
        right: null,
        height: 1
      };
    }

    if (gravity < node.gravity) {
      node.left = this.insert(node.left, id, evidenceId, crimeType, gravity);
    } else if (gravity > node.gravity) {
      node.right = this.insert(node.right, id, evidenceId, crimeType, gravity);
    } else {
      // Equal gravity, insert right
      node.right = this.insert(node.right, id, evidenceId, crimeType, gravity);
    }

    this.updateHeight(node);

    const balance = this.getBalance(node);

    // Left Left Case
    if (balance > 1 && gravity < (node.left?.gravity || 0)) {
      return this.rotateRight(node);
    }

    // Right Right Case
    if (balance < -1 && gravity > (node.right?.gravity || 0)) {
      return this.rotateLeft(node);
    }

    // Left Right Case
    if (balance > 1 && gravity > (node.left?.gravity || 0)) {
      node.left = this.rotateLeft(node.left!);
      return this.rotateRight(node);
    }

    // Right Left Case
    if (balance < -1 && gravity < (node.right?.gravity || 0)) {
      node.right = this.rotateRight(node.right!);
      return this.rotateLeft(node);
    }

    return node;
  }

  static toList(node: GameNode | null, list: GameNode[] = []): GameNode[] {
    if (node) {
      this.toList(node.left, list);
      list.push(node);
      this.toList(node.right, list);
    }
    return list;
  }
}
