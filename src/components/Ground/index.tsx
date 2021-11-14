import { FC } from 'react';
import DeathIcon from '../../utils/get_death_icon';
import { use_field_validation } from '../../utils/use_field_validation';

const Ground: FC<{ ground_count: number; teams: { [key: string]: string }; ground_arr: string[] }> = ({
  ground_count,
  teams,
  ground_arr,
}) => {
  return (
    <div
      className={'rounded-md bg-dark-42 bg-opacity-60 p-4 w-full  '}
      style={{ height: 'min-content', aspectRatio: '1' }}
    >
      <div className={'flex flex-col gap-1 '}>
        {Array.from({ length: ground_count }, (__, idx) => (
          <div key={idx + 'row'} className={'flex gap-1 '}>
            {Array.from({ length: ground_count }, (_, i) => {
              const index = idx * ground_count + i;
              const field: any = ground_arr[index];

              const background = use_field_validation(field, teams);

              return (
                <div
                  key={index + field}
                  className={'flex items-center justify-center'}
                  style={{
                    background,

                    width: 100 / ground_count + '%',
                    aspectRatio: '1',
                    height: 'min-content',
                  }}
                >
                  {field === 'DEATH' && <DeathIcon _className={'w-full p-2'} />}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ground;
