import { get_board_words } from './get_board_words';

export const generate_board = (length:number):string[] => {
  const board_words = get_board_words();
  //@ts-ignore
  return board_words?.randomize().slice(0,length);
};
