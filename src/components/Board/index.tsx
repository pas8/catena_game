import { FC } from 'react';
import { client } from '../../../pages';
import { use_field_validation } from '../../utils/use_field_validation';

const Board: FC<{
  board: string[];
  ground_count: number;
  room_id: string;
  activated_fields: number[];
  teams: { [key: string]: string };
}> = ({ board, ground_count, room_id, teams, activated_fields }) => {
  return (
    <div
      className={'rounded-md bg-dark-42 bg-opacity-60 p-4  '}
      style={{ height: 'min-content', aspectRatio: '1' }}
    >
      <div className={'flex flex-col gap-1 '}>
        {Array.from({ length: ground_count }, (__, idx) => (
          <div key={idx + 'row'} className={'flex gap-1 '}>
            {Array.from({ length: ground_count }, (_, i) => {
              const index = idx * ground_count + i;
              const field: any = board[index];
              const is_active = activated_fields.includes(index);

              const background = is_active ? use_field_validation(field, teams) : 'transparent';

              return (
                <button
                  onClick={() => {
                    client.send(
                      JSON.stringify({
                        type: 'resolve_acsess',
                        data: { index, room_id },
                      })
                    );
                  }}
                  key={index + field}
                  style={{
                    background,
                    width: 100 / ground_count + '%',
                    aspectRatio: '1',
                    height: 'min-content',
                  }}
                >
                  <h6 className={'text-primary-200 font-semibold text-xl border-primary-200 border-2 rounded-xl'}>{field}</h6>
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
