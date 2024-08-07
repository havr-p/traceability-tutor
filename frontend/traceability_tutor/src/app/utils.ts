import {ClassicPreset} from 'rete';
import {ActionSocket, TextSocket} from './sockets';
import {Validators} from "@angular/forms";

type Sockets = ActionSocket | TextSocket;
type Input = ClassicPreset.Input<Sockets>;
type Output = ClassicPreset.Output<Sockets>;

// export function getConnectionSockets(
//   editor: NodeEditor<Schemes>,
//   connection: Schemes["Connection"]
// ) {
//   const source = editor.getNode(connection.source);
//   const target = editor.getNode(connection.target);
//
//   const output =
//     source &&
//     (source.outputs as Record<string, Input>)[connection.sourceOutput];
//   const input =
//     target && (target.inputs as Record<string, Output>)[connection.targetInput];
//
//   return {
//     source: output?.socket,
//     target: input?.socket
//   };
// }


export function isArray(value: any): value is any[] {
    return Array.isArray(value);
}

export const githubTokenValidator = Validators.pattern('^github_pat_[A-Za-z0-9_]+$');
