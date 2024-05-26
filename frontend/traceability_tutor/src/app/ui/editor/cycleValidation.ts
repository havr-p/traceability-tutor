import {Structures} from "rete-structures/_types/types";
import {ConnProps, ItemProps, Schemes} from "../../types";

export class GraphCycleDetector {
    private readonly graph:  Structures<ItemProps, ConnProps>

    constructor(graph:  Structures<ItemProps, ConnProps>) {
        this.graph = graph;
    }

    public isCyclic(): boolean {
        const nodes = this.graph.nodes();
        const visited: { [key: string]: boolean } = {};
        const dfs: { [key: string]: boolean } = {};

        for (const node of nodes) {
            visited[node.id] = false;
            dfs[node.id] = false;
        }

        for (const node of nodes) {
            if (!visited[node.id]) {
                if (this.checkCycle(node.id, this.graph, visited, dfs)) {
                    return true;
                }
            }
        }

        return false;
    }

    private checkCycle(nodeId: string, graph: any, visited: { [key: string]: boolean }, dfs: { [key: string]: boolean }): boolean {
        visited[nodeId] = true;
        dfs[nodeId] = true;

        const outgoingNodes = graph.successors(nodeId).nodes();

        for (const neighbor of outgoingNodes) {
            if (!visited[neighbor.id]) {
                if (this.checkCycle(neighbor.id, graph, visited, dfs)) {
                    return true;
                }
            } else if (dfs[neighbor.id]) {
                return true;
            }
        }

        dfs[nodeId] = false;
        return false;
    }
}
