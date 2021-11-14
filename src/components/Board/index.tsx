import { FC } from 'react';
import { client } from '../../../pages';
import { use_field_validation } from '../../utils/use_field_validation';

const Board: FC<{
  board: string[];
  ground_count: number;
  room_id: string;
  ground_arr: string[];
  activated_fields: number[];
  on_click_of_placeholder: () => void;
  on_click_of_death: () => void;
  teams: { [key: string]: string };
}> = ({
  board,
  ground_count,
  room_id,
  teams,
  activated_fields,
  ground_arr,
  on_click_of_death,
  on_click_of_placeholder,
}) => {
  return (
    <div className={' bg-dark-42 bg-opacity-60 p-2 ring-2 ring-primary-400 ring-opacity-20  '} style={{ height: 'min-content', aspectRatio: '1' }}>
      <div className={'flex flex-col gap-2 '}>
        {Array.from({ length: ground_count }, (__, idx) => (
          <div key={idx + 'row'} className={'flex gap-2 '}>
            {Array.from({ length: ground_count }, (_, i) => {
              const index = idx * ground_count + i;
              const field: any = board[index];
const _field = ground_arr[index]
              const is_active = activated_fields.includes(index);
              const background = is_active ? use_field_validation(_field, teams) : undefined;

              const get_is_color_light = (color: string): boolean => {
                if (!color) return false;
                const hex = color.replace('#', '');
                const c_r = parseInt(hex.substr(0, 2), 16);
                const c_g = parseInt(hex.substr(2, 2), 16);
                const c_b = parseInt(hex.substr(4, 2), 16);
                const brightness = (c_r * 299 + c_g * 587 + c_b * 114) / 1000;
                return brightness > 155;
              };
              const is_color_light = is_active && get_is_color_light(background as string);

              return (
                <button
                  onClick={() => {
                    if(_field === 'PLACEHOLDER') {
                      on_click_of_placeholder()

                    } 
                    if(_field === 'DEATH') {

                      on_click_of_death()
                    }
                    client.send(
                      JSON.stringify({
                        type: 'open_field',
                        data: { index, room_id },
                      })
                    );
                  }}
                  style={{
                    background,
                    minWidth: 100,
                    width: 100 / ground_count + '%',
                    aspectRatio: '1',
                  }}
                  key={index + field}
                  className={`ring-primary-200  ring-opacity-40 p-1    ${
                    !is_active
                      ? 'hover:bg-primary-200  hover:text-dark-42 text-primary-200 '
                      : !is_color_light
                      ? 'text-white-42'
                      : 'text-dark-42'
                  }   ring-2 `}
                >
                  <h6 className={' font-semibold text-xl   '} style={{ wordBreak: 'break-word' }}>
                    {!is_active && field}
                  </h6>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Board;
