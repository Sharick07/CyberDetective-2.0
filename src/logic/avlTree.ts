import { GameNode, CrimeType } from '../types/game';

/**
 * Clase AVLTree — Árbol Binario de Búsqueda Auto-Balanceado (AVL)
 *
 * Almacena los nodos de evidencia del juego ordenados por la EDAD del sospechoso.
 * Tras cada inserción, el árbol se rebalancea automáticamente mediante rotaciones
 * para garantizar que la diferencia de alturas entre subárboles nunca supere 1.
 *
 * Todos los métodos son estáticos: no se crean instancias de esta clase.
 */
export class AVLTree {
  /** Incremented every time a rotation executes. Reset externally before each insert to detect rotations. */
  static rotationCount = 0;

  /**
   * Devuelve la altura de un nodo.
   * Si el nodo es nulo (hoja vacía), devuelve 0.
   */
  static getHeight(node: GameNode | null): number {
    return node ? node.height : 0;
  }

  /**
   * Calcula el factor de balance de un nodo.
   * Balance = altura(subárbol izquierdo) - altura(subárbol derecho)
   * - Si balance > 1 → el árbol está cargado a la izquierda (hay que rotar)
   * - Si balance < -1 → el árbol está cargado a la derecha (hay que rotar)
   */
  static getBalance(node: GameNode | null): number {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  /**
   * Recalcula y actualiza la altura de un nodo
   * basándose en la altura máxima de sus dos hijos.
   * Se llama después de cada inserción o rotación.
   */
  static updateHeight(node: GameNode): void {
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }

  static rotateRight(y: GameNode): GameNode {
    this.rotationCount++;
    const x = y.left!;   // x sube a ser la nueva raíz del subárbol
    const T2 = x.right;  // subárbol derecho de x que se reasigna

    x.right = y;   // y baja a ser hijo derecho de x
    y.left = T2;   // T2 se convierte en hijo izquierdo de y

    // Actualizar alturas: primero y (ahora es hijo), luego x (ahora es raíz)
    this.updateHeight(y);
    this.updateHeight(x);

    return x; // x es la nueva raíz del subárbol
  }

  static rotateLeft(x: GameNode): GameNode {
    this.rotationCount++;
    const y = x.right!;  // y sube a ser la nueva raíz del subárbol
    const T2 = y.left;   // subárbol izquierdo de y que se reasigna

    y.left = x;    // x baja a ser hijo izquierdo de y
    x.right = T2;  // T2 se convierte en hijo derecho de x

    // Actualizar alturas: primero x (ahora es hijo), luego y (ahora es raíz)
    this.updateHeight(x);
    this.updateHeight(y);

    return y; // y es la nueva raíz del subárbol
  }

  static insert(node: GameNode | null, id: string, evidenceId: string, crimeType: CrimeType, age: number, gravity: number): GameNode {
    // Caso base: posición vacía → crear y devolver el nuevo nodo
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

    // Paso 1: insertar recursivamente según la edad
    if (age < node.age) {
      node.left = this.insert(node.left, id, evidenceId, crimeType, age, gravity);
    } else if (age > node.age) {
      node.right = this.insert(node.right, id, evidenceId, crimeType, age, gravity);
    } else {
      // Edades iguales → insertar a la derecha para manejar duplicados
      node.right = this.insert(node.right, id, evidenceId, crimeType, age, gravity);
    }

    // Paso 2: actualizar la altura del nodo actual
    this.updateHeight(node);

    // Paso 3: calcular el factor de balance para detectar desbalanceo
    const balance = this.getBalance(node);

    // --- CASO Izquierda-Izquierda (II): rotación simple a la derecha ---
    if (balance > 1 && this.getBalance(node.left) >= 0) {
      return this.rotateRight(node);
    }

    // --- CASO Izquierda-Derecha (ID): doble rotación izquierda + derecha ---
    if (balance > 1 && this.getBalance(node.left) < 0) {
      node.left = this.rotateLeft(node.left!);
      return this.rotateRight(node);
    }

    // --- CASO Derecha-Derecha (DD): rotación simple a la izquierda ---
    if (balance < -1 && this.getBalance(node.right) <= 0) {
      return this.rotateLeft(node);
    }

    // --- CASO Derecha-Izquierda (DI): doble rotación derecha + izquierda ---
    if (balance < -1 && this.getBalance(node.right) > 0) {
      node.right = this.rotateRight(node.right!);
      return this.rotateLeft(node);
    }

    // El árbol ya estaba balanceado, devolver el nodo sin cambios
    return node;
  }

  /**
   * Recorre el árbol en INORDEN (izquierda → raíz → derecha)
   * y devuelve todos los nodos en un arreglo ordenado de menor a mayor edad.
   * Se usa para listar o reconstruir los nodos del árbol.
   */
  static toList(node: GameNode | null, list: GameNode[] = []): GameNode[] {
    if (node) {
      this.toList(node.left, list);   // visitar subárbol izquierdo
      list.push(node);                // procesar nodo actual
      this.toList(node.right, list);  // visitar subárbol derecho
    }
    return list;
  }
}
