import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import Button from '../src/components/Button';
import Container from '../src/components/Container';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { HexColorPicker } from 'react-colorful';
import { toast } from 'react-toastify';
import Ground from '../src/components/Ground';
import Board from '../src/components/Board';
import { generate_board } from '../src/utils/generate_board';

export const client = new W3CWebSocket('ws://127.0.0.1:8000');

const Home: NextPage = () => {
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
  const PLACEHOLDER = 'PLACEHOLDER';

  const [is_adding_team, set_is_adding_team] = useState(false);
  const [is_chosing_team_color, set_is_chosing_team_color] = useState(false);
  const [is_in_preview_mode, set_is_in_preview_mode] = useState(false);

  const nullity_of_new_tema_properties = { name: '', color: 'red' };
  const [new_team_propertyies, set_new_team_propertyies] = useState(nullity_of_new_tema_properties);

  const [state, setState] = useState({
    is_game_started: false,
    is_trying_to_connect: false,
    board: [] as string[],
    activated_fields: [] as number[],
    ground_count: 5,
    percent_of_teams_fields: 60,
    is_game_in_creating_process: false,
    teams: {
      meteor: '#daa55b',
      dodger: '#72a7f1',
    },
    random_ground_arr: [],
  });

  const use_genegate_ground_arr = () => {
    const team_count = Object.values(state.teams).length;
    const percent_of_each_team_field = state.percent_of_teams_fields / team_count;
    const all_ground_fields_count = state.ground_count * state.ground_count;

    const count_of_each_team_fields = Math.round((all_ground_fields_count / 100) * percent_of_each_team_field);
    const teams_fields_arr = Object.keys(state.teams)
      .map((name) => Array(count_of_each_team_fields).fill(name))
      .flat();

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
    setState((state) => ({
      ...state,
      teams: { ...state.teams, [new_team_propertyies.name]: new_team_propertyies.color },
    }));
  };

  const handle_start_the_game = () => {
    setState((state) => ({ ...state, is_game_in_creating_process: true }));
  };

  const handle_create_game_room = () => {
    const random_ground_arr = use_genegate_ground_arr();
    const board = generate_board(state.ground_count * state.ground_count);

    setState((state) => ({
      ...state,
      is_game_in_creating_process: false,
      is_game_started: true,
      random_ground_arr,
      board,
    }));

    const data = { ground: random_ground_arr, teams: state.teams, admin_id: '1', board };
    client.send(
      JSON.stringify({
        type: 'create_room',
        data,
      })
    );
  };

  const handle_try_to_connect = () => {
    setState((state) => ({ ...state, is_trying_to_connect: true }));
  };

  const [connect_room_id, set_connect_room_id] = useState('');

  const handle_connect_to_game = () => {
    const data = { user_id: 'guess', connect_room_id };
    client.send(
      JSON.stringify({
        type: 'asking_for_acsess',
        data,
      })
    );
  };
  const [room_id, set_room_id] = useState('');
  const [is_sign_as_player, set_is_sign_as_player] = useState(false);

  const [awaiting_users, set_awaiting_users] = useState([] as string[]);

  useEffect(() => {
    client.onopen = () => {
      console.log('WebSocket Client Connected');
    };
    client.onmessage = (message) => {
      const { type, ...data } = JSON.parse(message.data as string);
      switch (type) {
        case 'room_id': {
          return set_room_id(data.room_id);
        }
        case 'updated_of_activated_fields': {
          return setState((state) => ({ ...state, ...data }));
        }

        case 'asking_for_acsess': {
          return set_awaiting_users((p) => [...p, data.user_id]);
        }
        case 'resolve_acsess': {
          setState((state) => ({ ...state, random_ground_arr: data.ground, is_trying_to_connect: false }));
          return set_is_sign_as_player(true);
        }
        case 'reject_acsess': {
          setState((state) => ({ ...state, is_trying_to_connect: false }));
          return set_is_sign_as_player(false);
        }
        default:
          break;
      }
      console.log(message);
    };
  }, [client]);

  const close_svg = (
    <svg viewBox='0 0 24 24' className={'w-8 h-8 text-secondary-200'}>
      <path
        fill={'currentColor'}
        d='M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z'
      ></path>
    </svg>
  );
  const success_svg = (
    <svg viewBox='0 0 24 24' className={'w-8 h-8 text-primary-200'}>
      <path fill={'currentColor'} d='M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'></path>
    </svg>
  );

  const handle_reject_user = (user_id: string) => {
    const data = { user_id, room_id };
    client.send(
      JSON.stringify({
        type: 'reject_acsess',
        data,
      })
    );
    set_awaiting_users((arr) => arr.filter((__) => __ !== user_id));
  };

  const handle_resolve_user = (user_id: string) => {
    const data = { user_id, room_id };

    client.send(
      JSON.stringify({
        type: 'resolve_acsess',
        data,
      })
    );
    set_awaiting_users((arr) => arr.filter((__) => __ !== user_id));
  };

  const default_props = {
    ground_arr: state.random_ground_arr,
    teams: state.teams,
    ground_count: state.ground_count,
  };
  return (
    <Container>
      <div className={'min-h-screen p-10 items-center flex justify-center'}>
        {!state.is_game_in_creating_process &&
          !state.is_game_started &&
          !state.is_trying_to_connect &&
          !is_sign_as_player && (
            <div
              className={
                ' flex flex-col gap-4 bg-secondary-400 bg-opacity-10 p-4 ring-2 ring-secondary-600 ring-opacity-40  rounded-xl'
              }
            >
              <h2 className={'font-bold	text-secondary-200 text-5xl'}>Game Utils</h2>

              <Button onClick={handle_start_the_game}>Start new game</Button>
              <Button isSecondary onClick={handle_try_to_connect}>
                Connect to game
              </Button>
            </div>
          )}

        {state.is_trying_to_connect && (
          <div
            className={
              ' flex flex-col gap-4 bg-secondary-200 bg-opacity-20 p-4 ring-2 ring-secondary-600 ring-opacity-40  rounded-xl'
            }
          >
            <h4 className={'font-bold	text-secondary-100 text-3xl'}>Room id</h4>
            <input
              onChange={({ target: { value } }) => set_connect_room_id(value)}
              value={connect_room_id}
              placeholder={'Write...'}
              className={
                'p-4 bg-secondary-200 bg-opacity-20 rounded-xl text-primary-100  ring-2  ring-secondary-400 ring-opacity-80'
              }
            />

            <Button isSecondary rounded={'xl'} onClick={handle_connect_to_game}>
              Ask for acsess
            </Button>
          </div>
        )}

        {is_sign_as_player && (
          <div
            className={
              'flex flex-col gap-4 bg-secondary-200 bg-opacity-5 p-4 ring-2 ring-secondary-600 ring-opacity-40  rounded-xl'
            }
          >
            <h2 className={'font-bold	text-secondary-200 text-5xl'}>id: {room_id}</h2>
            <div className={'w-96 h-96 '}>
              <Ground {...default_props} />
            </div>
          </div>
        )}

        {state.is_game_started && (
          <div
            className={
              'flex flex-col gap-4 bg-secondary-600 bg-opacity-10 p-4 ring-2 ring-secondary-600 ring-opacity-40  rounded-xl'
            }
          >
            <h2 className={'font-bold	text-secondary-200 text-5xl'}>id: {room_id}</h2>
            <div className={''}>
              {awaiting_users.map((id) => (
                <div key={id} className={'flex items-center gap-2 p-2 border-2 border-secondary-200 rounded-xl'}>
                  <h2 className={'font-bold	text-secondary-100 text-1xl'}>{id}</h2>
                  <button onClick={() => handle_reject_user(id)}>{close_svg}</button>
                  <button onClick={() => handle_resolve_user(id)}>{success_svg}</button>
                </div>
              ))}
              <Board
                board={state.board}
                room_id={room_id}
                {...default_props}
                activated_fields={state.activated_fields}
              />
            </div>
          </div>
        )}

        {state.is_game_in_creating_process && (
          <div
            className={
              'flex flex-col gap-4 bg-secondary-400 bg-opacity-10 p-4 ring-2 ring-secondary-400 ring-opacity-50  rounded-xl'
            }
          >
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
                  {Object.entries(state.teams).map(([name, color]) => (
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
                          {close_svg}
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
                    if (Object.keys(state.teams).includes(new_team_propertyies.name))
                      return toast('Name must be uniq!', { type: 'error', theme: 'colored' });
                    if (Object.values(state.teams).includes(new_team_propertyies.color))
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
              <Ground {...default_props} />
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
