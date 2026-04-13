import { GameNode, CrimeType } from '../types/game';

export class AVLTree {
  /** Incremented every time a rotation executes. Reset externally before each insert to detect rotations. */
  static rotationCount = 0;

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
    this.rotationCount++;
    const x = y.left!;
    const T2 = x.right;

    x.right = y;
    y.left = T2;

    this.updateHeight(y);
    this.updateHeight(x);

    return x;
  }

  static rotateLeft(x: GameNode): GameNode {
    this.rotationCount++;
    const y = x.right!;
    const T2 = y.left;

    y.left = x;
    x.right = T2;

    this.updateHeight(x);
    this.updateHeight(y);

    return y;
  }

  static insert(node: GameNode | null, id: string, evidenceId: string, crimeType: CrimeType, age: number, gravity: number): GameNode {
    if (!node) {
      return {
        id,
        evidenceId,
        crimeType,
        age,
        gravity,
        left: null,
        right: null,
        height: 1
      };
    }

    if (age < node.age) {
      node.left = this.insert(node.left, id, evidenceId, crimeType, age, gravity);
    } else if (age > node.age) {
      node.right = this.insert(node.right, id, evidenceId, crimeType, age, gravity);
    } else {
      // Equal age, insert right
      node.right = this.insert(node.right, id, evidenceId, crimeType, age, gravity);
    }

    this.updateHeight(node);

    const balance = this.getBalance(node);

    // Left Left Case
    if (balance > 1 && this.getBalance(node.left) >= 0) {
      return this.rotateRight(node);
    }

    // Left Right Case
    if (balance > 1 && this.getBalance(node.left) < 0) {
      node.left = this.rotateLeft(node.left!);
      return this.rotateRight(node);
    }

    // Right Right Case
    if (balance < -1 && this.getBalance(node.right) <= 0) {
      return this.rotateLeft(node);
    }

    // Right Left Case
    if (balance < -1 && this.getBalance(node.right) > 0) {
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
