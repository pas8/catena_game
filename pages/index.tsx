import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import Button from '../src/components/Button';
import Container from '../src/components/Container';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { HexColorPicker } from 'react-colorful';
import { toast } from 'react-toastify';

const client = new W3CWebSocket('ws://127.0.0.1:8000');

const Home: NextPage = () => {
  useEffect(() => {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };
    client.onmessage = (message) => {
      console.log(message);
    };
  }, []);

  //@ts-ignore
  Array.prototype.randomize = function () {
    const new_arr = this.slice();
    for (let i = new_arr.length - 1; i > 0; i--) {
      const rand = ~~(Math.random() * (i + 1));
      [new_arr[i], new_arr[rand]] = [new_arr[rand], new_arr[i]];
    }
    return new_arr;
  };

  const DEATH = 'DEATH';
  const PLACEHOLDER = 'placeholder';

  const [is_adding_team, set_is_adding_team] = useState(false);
  const [is_chosing_team_color, set_is_chosing_team_color] = useState(false);
  const [is_in_preview_mode, set_is_in_preview_mode] = useState(false);

  const nullity_of_new_tema_properties = { name: '', color: 'red' };
  const [new_team_propertyies, set_new_team_propertyies] = useState(nullity_of_new_tema_properties);

  const [state, setState] = useState({
    is_game_started: false,
    ground_count: 5,
    percent_of_teams_fields: 60,
    is_game_in_creating_process: false,
    teams: [
      { name: 'meteor', color: '#daa55b' },
      { name: 'dodger', color: '#72a7f1' },
    ],
    random_ground_arr: [],
  });

  const use_genegate_ground_arr = () => {
    const team_count = state.teams.length;
    const percent_of_each_team_field = state.percent_of_teams_fields / team_count;
    const all_ground_fields_count = state.ground_count * state.ground_count;

    const count_of_each_team_fields = Math.round((all_ground_fields_count / 100) * percent_of_each_team_field);
    const teams_fields_arr = state.teams.map(({ name }) => Array(count_of_each_team_fields).fill(name)).flat();

    const ground_arr = [
      ...teams_fields_arr,
      ...Array(all_ground_fields_count - teams_fields_arr.length - 1).fill(PLACEHOLDER),
      DEATH,
    ];

    //@ts-ignore
    const random_ground_arr = ground_arr.randomize();
    return random_ground_arr;
  };

  const handle_genegate_preview = () => {
    const random_ground_arr = use_genegate_ground_arr();

    setState((state) => ({ ...state, random_ground_arr }));
    set_is_in_preview_mode(true);
  };

  const handle_add_new_team = () => {
    setState((state) => ({ ...state, teams: [...state.teams, new_team_propertyies] }));
  };

  const handle_start_the_game = () => {
    setState((state) => ({ ...state, is_game_in_creating_process: true }));
  };

  const handle_create_game_room = () => {
    const random_ground_arr = use_genegate_ground_arr();

    setState((state) => ({ ...state, is_game_in_creating_process: false, is_game_started: true, random_ground_arr }));

    client.send(
      JSON.stringify({
        type: 'create_room',
        data: { ground: state.random_ground_arr, teams: state.teams },
      })
    );
  };

  return (
    <Container>
      <div className={'min-h-screen p-10 items-center flex justify-center'}>
        {!state.is_game_in_creating_process && !state.is_game_started && (
          <Button isContained onClick={handle_start_the_game}>
            Start new game
          </Button>
        )}

        {state.is_game_in_creating_process && (
          <div
            className={
              'flex flex-col gap-4 bg-secondary-400 bg-opacity-10 p-4 ring-2 ring-secondary-400 ring-opacity-50  rounded-xl'
            }
          >
            {state.is_game_started && <div className={'w-60 h-60'}></div>}

            {!is_in_preview_mode ? (
              <div className={'flex flex-col gap-4 bg-dark-42 bg-opacity-80 rounded-xl p-4'}>
                {[
                  {
                    title: `Ground number ${state.ground_count} x ${state.ground_count}`,
                    key: 'ground_count',

                    min: 4,
                    max: 8,
                  },
                  {
                    key: 'percent_of_teams_fields',
                    title: `${state.percent_of_teams_fields} percent of team fields`,
                    min: 42,
                    max: 80,
                  },
                ].map(({ key, title, ...props }) => (
                  <div className={'flex flex-col gap-1 border-b-2 border-secondary-300 pb-4'} key={key}>
                    <h4 className={'text-secondary-100 text-2xl font-bold rounded-md'}>{title}</h4>
                    <input
                      type={'range'}
                      {...props}
                      //@ts-ignore
                      defaultValue={state[key]}
                      onChange={({ target: { value } }) => setState((state) => ({ ...state, [key]: +value }))}
                    />
                  </div>
                ))}

                <div className={'flex flex-col gap-2'}>
                  <h4 className={'text-secondary-100 text-2xl font-bold'}>Teams</h4>
                  {state.teams.map(({ color, name }) => (
                    <div
                      style={{ borderColor: color }}
                      className={'border-2 rounded-2xl flex gap-2 items-center p-2'}
                      key={name + color}
                    >
                      <div style={{ background: color }} className={'rounded-full w-10 h-10'}></div>
                      <h4 className={'font-bold	text-secondary-200 text-sm'}>{name}</h4>
                    </div>
                  ))}
                  {is_adding_team && (
                    <div
                      className={'flex flex-col gap-2 border-2 p-2 rounded-2xl'}
                      style={{ borderColor: new_team_propertyies.color }}
                    >
                      {is_chosing_team_color && (
                        <HexColorPicker
                          style={{ width: '100%' }}
                          color={new_team_propertyies.color}
                          onChange={(color) => set_new_team_propertyies((state) => ({ ...state, color }))}
                        ></HexColorPicker>
                      )}
                      <div className={'flex gap-2'}>
                        <button
                          onClick={() => set_is_chosing_team_color((p) => !p)}
                          style={{ background: new_team_propertyies.color }}
                          className={'rounded-full w-10 h-10'}
                        ></button>
                        <input
                          placeholder={'Name...'}
                          className={'font-bold	text-secondary-200 text-sm bg-opacity-0 bg-primary-100 p-2  rounded-xl'}
                          value={new_team_propertyies.name}
                          onChange={({ target: { value } }) =>
                            set_new_team_propertyies((state) => ({ ...state, name: value }))
                          }
                        />
                        <button
                          onClick={() => {
                            set_is_chosing_team_color(false);
                            set_is_adding_team(false);
                          }}
                        >
                          <svg viewBox='0 0 24 24' className={'w-8 h-8 text-secondary-200'}>
                            <path
                              fill={'currentColor'}
                              d='M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z'
                            ></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  isSecondary
                  isContained={is_adding_team}
                  onClick={() => {
                    if (!is_adding_team) return set_is_adding_team(true);
                    if (!new_team_propertyies.name.trim())
                      return toast('Name can not be empty', { type: 'error', theme: 'colored' });
                    if (state.teams.some(({ name }) => name === new_team_propertyies.name))
                      return toast('Name must be uniq!', { type: 'error', theme: 'colored' });
                    if (state.teams.some(({ color }) => color === new_team_propertyies.color))
                      return toast('Color must be uniq!', { type: 'error', theme: 'colored' });

                    set_is_chosing_team_color(false);
                    set_is_adding_team(false);
                    set_new_team_propertyies(nullity_of_new_tema_properties);
                    handle_add_new_team();
                  }}
                >
                  {is_adding_team ? 'Confirm' : 'Add team'}
                </Button>
              </div>
            ) : (
              <div className={'rounded-md bg-dark-42 bg-opacity-60 p-4 '}>
                <div className={'flex flex-col gap-1 '}>
                  {Array.from({ length: state.ground_count }, (__, idx) => (
                    <div key={idx + 'row'} className={'flex gap-1 '}>
                      {Array.from({ length: state.ground_count }, (_, i) => {
                        const index = idx * state.ground_count + i;
                        const field = state.random_ground_arr[index];

                        const is_death = field === DEATH;
                        const is_placeholder = field === PLACEHOLDER;
                        const background = is_death
                          ? 'red'
                          : is_placeholder
                          ? 'transparent'
                          : state.teams.find(({ name }) => name === field)?.color;

                        return (
                          <div
                            key={index + field}
                            style={{
                              background,
                              width: 100 / state.ground_count + '%',
                              aspectRatio: '1',
                              height: 'min-content',
                            }}
                          ></div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button
              onClick={
                !is_in_preview_mode
                  ? handle_genegate_preview
                  : () => {
                      setState((state) => ({ ...state, random_ground_arr: [] }));
                      set_is_in_preview_mode(false);
                    }
              }
              rounded={'xl'}
              isSecondary
              isContained={is_in_preview_mode}
            >
              {is_in_preview_mode ? 'Back to setuping' : 'Generate preview'}
            </Button>
            <Button onClick={handle_create_game_room} rounded={'xl'}>
              Create game room
            </Button>
          </div>
        )}
      </div>
    </Container>
  );
};

export default Home;
