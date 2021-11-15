import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import Button from '../src/components/Button';
import Container from '../src/components/Container';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import { HexColorPicker } from 'react-colorful';
import { toast } from 'react-toastify';
import Ground from '../src/components/Ground';
import { generate_board } from '../src/utils/generate_board';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Confetti from 'react-dom-confetti';
import { useRouter } from 'next/dist/client/router';

const Board = dynamic(() => import('../src/components/Board'), {});

// export const client = new W3CWebSocket('ws://127.0.0.1:8000 ');
export const client = new W3CWebSocket('ws://catenagame.herokuapp.com');

const Home: NextPage = () => {
  const { reload } = useRouter();

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

  const nullity_of_new_team_properties = { name: '', color: 'red' };
  const [new_team_propertyies, set_new_team_propertyies] = useState(nullity_of_new_team_properties);

  const [state, setState] = useState({
    is_game_started: false,
    is_timer_started: false,
    is_trying_to_connect: false,
    board: [] as string[],
    activated_fields: [] as number[],
    ground_count: 5,
    time_to_move: 4,
    interval: null as any,
    count_of_each_team_fields: 8,
    team_move_order: [] as string[],
    percent_of_teams_fields: 60,
    is_death_field_includes: false,
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
    ].concat(state.is_death_field_includes ? DEATH : PLACEHOLDER);

    //@ts-ignore
    const random_ground_arr = ground_arr.randomize();
    return [random_ground_arr, count_of_each_team_fields];
  };

  const handle_genegate_preview = () => {
    const [random_ground_arr] = use_genegate_ground_arr();

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
    const [random_ground_arr, count_of_each_team_fields] = use_genegate_ground_arr();
    const board = generate_board(state.ground_count * state.ground_count);

    setState((state) => ({
      ...state,
      is_game_in_creating_process: false,
      is_game_started: true,
      random_ground_arr,
      count_of_each_team_fields,
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
  const [connected_users, set_connected_users] = useState([] as string[]);

  useEffect(() => {
    client.onclose = () => {
      console.log('WebSocket Client Closed');
    };
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
          setState((state) => ({
            ...state,
            teams: data.teams,
            random_ground_arr: data.ground,
            is_trying_to_connect: false,
            ground_count: Math.sqrt(data.ground.length),
          }));
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
    set_connected_users((arr) => arr.filter((__) => __ !== user_id));
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
    set_connected_users((arr) => [...arr, user_id]);
  };

  const default_props = {
    ground_arr: state.random_ground_arr,
    teams: state.teams,
    ground_count: state.ground_count,
  };
  useEffect(() => {
    set_timer_propertyies((_state) => ({ ..._state, left: state.time_to_move * 1000 * 60 }));
  }, [state.time_to_move]);

  const [timer_propertyies, set_timer_propertyies] = useState({
    team_move_name: '',
    left: 8,
  });

  const set_next_team_move = () => {
    const team_move_name =
      state.team_move_order[state.team_move_order.findIndex((__) => __ === timer_propertyies.team_move_name) + 1];
    set_timer_propertyies((_state) => ({ ..._state, team_move_name, left: state.time_to_move * 1000 * 60 }));
  };

  const start_timer = () => {
    const is_last = timer_propertyies.team_move_name === state.team_move_order[state.team_move_order.length - 1];

    if (!timer_propertyies.team_move_name || is_last) {
      set_timer_propertyies((_state) => ({ ..._state, team_move_name: state.team_move_order[0] }));
    } else {
      set_next_team_move();
    }

    const inverval = setInterval(() => {
      set_timer_propertyies((state) => ({ ...state, left: state.left - 1000 }));
    }, 1000);

    setTimeout(() => {
      clearInterval(inverval);
      toast('Time left! please chose fields, and then click to button', { theme: 'colored', type: 'info' });
      set_next_team_move();
    }, state.time_to_move * 1000 * 60);
    return inverval;
  };
  const [winner, set_winner] = useState('');

  const confity_config = {
    angle: 0,
    spread: 360,
    startVelocity: 96,
    elementCount: 200,
    dragFriction: 0.15,
    duration: 8000,
    stagger: 4,
    width: '48px',
    //@ts-ignore
    colors: [state?.teams?.[winner]] as string[],
    height: '48px',
    perspective: '1000px',
  };
  useEffect(() => {
    if (!!winner) {
      toast('We have winner:' + winner, { theme: 'colored', type: 'success' });

      setTimeout(() => {
        reload();
      }, confity_config.duration);
    }
  }, [winner]);

  const handle_creating_or_editing_team = (props: any) => {
    if (!is_adding_team) {
      set_new_team_propertyies(props);
      return set_is_adding_team(true);
    }
    if (!new_team_propertyies.name.trim()) return toast('Name can not be empty', { type: 'error', theme: 'colored' });
    if (Object.keys(state.teams).includes(new_team_propertyies.name))
      return toast('Name must be uniq!', { type: 'error', theme: 'colored' });
    if (Object.values(state.teams).includes(new_team_propertyies.color))
      return toast('Color must be uniq!', { type: 'error', theme: 'colored' });

    set_is_chosing_team_color(false);
    set_is_adding_team(false);
    set_new_team_propertyies(nullity_of_new_team_properties);
    handle_add_new_team();
  };

  const [is_wasted, set_is_wasted] = useState(false);
  useEffect(() => {
    if (!!is_wasted) {
      toast(`WASTED! ${timer_propertyies.team_move_name} destoyed this game!`, {
        theme: 'dark',
        type: 'error',
      });
      setTimeout(() => {
        reload();
      }, 8000);
    }
  }, [is_wasted]);

  const get_time_left = () => {
    const m = ~~((timer_propertyies.left / 60000) % 60);
    const s = ~~((timer_propertyies.left / 1000) % 60);
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };
  const [is_full_screen, set_is_full_screen] = useState(false);
  return (
    <>
      <Head>
        <title>Catena</title>
      </Head>
      {!!is_wasted && (
        <div
          className={
            'fixed inset-0 flex items-center justify-center bg-dark-42 bg-opacity-80 backdrop-blur-md backdrop-filter z-50'
          }
        >
          {' '}
          <svg className={'w-11/12 '} viewBox={'0 0 867 231'} xmlns='http://www.w3.org/2000/svg'>
            <g transform='matrix(3.7795276,0,0,3.7795276,23.841986,-252.31674)'>
              <g
                transform='translate(-37.126493,-82.574158)'
                //@ts-ignore
                style={{ color: state.teams?.[timer_propertyies.team_move_name] }}
              >
                <path
                  style={{ fill: 'currentColor', stroke: 'none', strokeWidth: 8.17237 }}
                  d='m 40.265416,209.79883 c -5.0267,-5.19023 -3.657627,-14.584 -5.602751,-21.55055 -1.57091,-7.55547 -1.983144,-15.35249 -3.844364,-22.82032 1.548326,-8.8043 13.65958,-4.76174 19.844009,-4.87923 7.192328,0.0612 15.329702,-1.59198 22.544323,0.50997 7.977716,-2.50131 16.491561,0.23936 24.616568,-0.97184 7.198609,0.40149 14.836549,-1.22718 21.743859,1.13816 6.17761,1.12602 13.96147,-2.73489 21.2932,-1.21226 7.69777,-0.56596 13.76065,2.65209 20.92198,0.0875 5.95389,-0.74952 11.87626,-0.0423 16.5183,2.88102 5.1013,-0.48776 10.96696,1.50947 15.25865,-1.96297 7.92963,-1.99891 16.39367,-0.74931 24.5174,-0.74716 6.38234,4.08714 12.07869,-1.62056 19.21283,-0.38579 -1.8898,-8.50613 5.16991,-11.68364 12.40908,-10.05214 10.41435,-2.89061 11.43963,7.36387 10.26551,14.89418 0.0215,13.95997 0.21014,27.92979 -0.18612,41.88318 -3.73485,7.39908 -14.83083,1.96437 -21.59718,3.59524 -6.26394,1.57631 -12.34469,-3.00248 -17.76406,-0.06 -8.85631,-0.15642 -17.87567,0.31075 -26.63095,-0.23206 -5.73794,-1.8946 -12.48116,1.49916 -18.90836,0.21286 -7.11889,1.34258 -14.69687,-2.07547 -20.57396,-1.39979 -7.26831,2.91355 -15.72627,0.65206 -23.46595,1.38348 -7.18936,-0.82492 -14.16036,0.62738 -21.49198,0.12625 -7.21163,-0.88328 -16.04008,2.24589 -21.727476,-3.43678 -2.002079,2.34873 -4.681215,4.28965 -8.320239,3.38369 -5.663279,-0.17973 -11.481292,0.76034 -17.001831,-0.69249 -7.102435,1.35087 -14.856277,0.91801 -22.030488,0.3078 z m 18.926794,-5.28232 c 1.442518,-3.77309 1.476089,-16.67702 3.802181,-15.14992 2.259833,4.47757 -0.790175,16.07324 5.054484,16.43318 4.764357,-0.0627 9.532313,-0.0253 14.292825,-0.23649 2.180532,-13.24336 4.706491,-26.49922 6.410966,-39.88007 -1.500159,-1.957 -6.945561,-0.13842 -9.788684,-0.81001 -6.709209,0.87098 -3.03644,13.59075 -6.040048,19.12257 -1.626325,0.35453 -1.896087,-11.92971 -3.091543,-15.90172 0.943462,-5.11312 -4.607462,-2.70314 -7.600564,-3.24304 -3.962362,-0.34639 -8.116043,-0.56762 -6.896764,5.00912 -1.572537,3.9515 -0.822287,12.7523 -3.07024,13.92729 -3.141573,-6.91071 1.686282,-22.03551 -9.941732,-18.92023 -5.622621,-0.91593 -8.654172,0.17062 -5.835634,6.08736 1.669478,11.6088 3.74106,23.15469 5.518912,34.75402 5.726879,0.14252 11.457461,-0.0148 17.185841,-0.0374 0,-0.38489 0,-0.76978 0,-1.15467 z m 61.82941,-16.85118 c -1.37464,-7.1802 3.28147,-17.83646 -3.6086,-22.49574 -7.77998,-0.6865 -15.66215,-0.27915 -23.461361,0.0437 -4.908944,1.18349 -3.20784,9.21115 -2.662692,12.22253 4.283305,-0.24805 8.965313,0.36738 12.958363,-0.59754 -0.11629,-3.33669 4.79958,-1.61077 3.05544,1.67296 -0.007,3.39912 -6.32894,0.45591 -8.702514,1.51623 -9.256493,-1.83498 -8.053961,8.16791 -7.784814,14.23829 0.229301,3.1197 -0.449019,6.59225 0.320209,9.50205 4.751404,4.03049 12.109079,1.08944 17.901359,1.98441 3.9717,-0.0186 7.94341,-0.0372 11.91511,-0.0557 0.0232,-6.0104 0.0463,-12.02079 0.0695,-18.03119 z m 30.79801,17.41219 c 3.98174,-6.15138 2.47365,-15.37047 1.25445,-22.36808 -3.69707,-4.3128 -10.32184,-2.27351 -15.46421,-2.8297 -1.06081,-1.76325 -0.96444,-5.99181 2.63338,-4.76163 -0.65624,3.67884 4.14671,1.49231 6.33191,2.11829 2.23078,-0.55726 6.83016,1.27927 7.48676,-0.86892 0.82292,-5.75434 -0.75039,-13.51875 -8.45664,-11.40704 -6.81931,1.12146 -15.81489,-2.70662 -21.34568,2.13317 0.28349,7.12792 -2.84537,16.97566 1.83816,22.6458 4.69217,2.59508 16.04291,-2.93082 14.31481,5.54082 -3.99434,1.19435 -2.59322,-3.07923 -6.58926,-1.92792 -3.3444,-0.0362 -6.68881,-0.0724 -10.03321,-0.10865 0.24071,4.68317 -1.73093,13.18365 5.43741,12.46491 7.50961,-0.14203 15.16696,0.3813 22.59212,-0.63105 z m 34.31503,0.43829 c 5.75577,-2.91696 1.94918,-11.44881 2.98936,-16.79528 -0.0201,-2.85874 -0.0402,-5.71747 -0.0603,-8.57621 -4.32455,0 -8.64909,0 -12.97364,0 -0.0478,5.09035 -0.0957,10.1807 -0.14356,15.27105 -4.17072,1.26404 -3.69012,-2.12325 -3.50527,-5.21479 0.93121,-4.43636 -3.0554,-14.09204 4.29541,-12.59584 4.15389,-0.0472 8.30813,-0.0215 12.4622,-0.0281 0,-3.4236 0,-6.8472 0,-10.2708 -5.58587,0 -11.17174,0 -16.75761,0 1.20847,-4.13182 -3.70665,-2.07112 -6.16213,-2.49773 -2.20868,0.6138 -6.64836,-1.14396 -7.39047,1.0288 -0.28847,2.49812 -4.97065,0.50522 -3.20501,4.81441 0.67212,2.18022 -1.5701,7.12672 1.55413,6.9794 3.21331,-0.16462 0.87035,5.0065 1.63677,7.19165 0.25126,6.36868 -0.37481,12.85553 0.90383,19.11358 6.4634,3.78342 15.16268,1.03867 22.55558,1.73013 1.26711,-0.0388 2.53705,-0.0341 3.80073,-0.15026 z m 33.61786,-0.18033 c 3.32478,-1.46049 4.35213,-10.96898 1.40418,-11.94724 -4.03066,0 -8.06133,0 -12.09199,0 -1.69919,7.15794 -6.83862,-5.88293 0.74825,-2.9113 4.25502,-0.0624 8.51064,-0.0441 12.76597,-0.0618 -0.27276,-7.6996 0.91585,-15.60275 -0.68386,-23.14732 -6.05997,-4.79733 -15.17631,-1.31685 -22.5043,-2.26477 -5.64392,-1.37538 -8.03827,3.19946 -6.94851,7.86781 0.10604,10.14974 -0.28877,20.32768 0.33785,30.45401 5.25453,5.05222 14.12933,1.35843 20.88294,2.31423 2.02999,-0.0771 4.06948,-0.0597 6.08947,-0.3036 z m 35.93625,-25.12823 c -1e-5,-8.53802 -4e-5,-17.07603 -5e-5,-25.61405 -4.51632,0.0481 -9.03263,0.0963 -13.54894,0.14442 -0.0771,4.87385 1.54884,12.53038 -6.1301,10.17348 -8.18744,-2.28048 -12.53346,3.43659 -10.58614,11.15148 0.34969,9.24817 -0.87928,18.93944 0.91212,27.90261 5.40811,3.47512 12.84707,1.17997 19.15636,1.85612 3.39894,0 6.79787,0 10.19681,0 -2e-5,-8.53802 -4e-5,-17.07604 -6e-5,-25.61406 z'
                  id='path1381'
                />
                <path
                  style={{ fill: 'currentColor', stroke: 'none', strokeWidth: 6 }}
                  d='m 104.39913,195.39276 c -1.09169,-2.99789 -0.41114,-8.31198 3.01159,-5.71026 -0.53942,2.5414 1.56676,7.27009 -3.01159,5.71026 z'
                  id='path1537'
                />
                <path
                  style={{ fill: 'currentColor', stroke: 'none', strokeWidth: 6 }}
                  d='m 239.22913,195.48974 c -0.67158,-6.65919 -0.19034,-13.4959 -0.32952,-20.23299 4.02164,-1.26407 3.04182,2.47332 3.05792,5.21479 0,4.95093 0,9.90185 0,14.85278 -0.92278,-0.10487 -1.80819,0.26864 -2.7284,0.16542 z'
                  id='path1576'
                />
                <path
                  style={{ fill: 'currentColor', stroke: 'none', strokeWidth: 2 }}
                  d='m 206.01415,180.87898 c -2.8648,-7.51815 5.22814,-6.91404 3.05059,-0.13418 -0.81171,0.67618 -2.17713,-0.13873 -3.05059,0.13418 z'
                  id='path1654'
                />
              </g>
            </g>
          </svg>{' '}
        </div>
      )}
      <div className={!!winner ? 'confiti_container' : ''}>
        <Confetti active={!!winner} config={confity_config} />
      </div>
      {!winner && (
        <Container>
          <div className={'min-h-screen p-10 items-center flex justify-center py-32'}>
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
                <h2 className={'font-bold	text-secondary-200 text-5xl flex items-center justify-between'}>
                  <span>id: {connect_room_id}</span>{' '}
                </h2>
                <div className={'w-96 h-96 '}>
                  <Ground {...default_props} />
                </div>
              </div>
            )}

            {state.is_game_started && (
              <div
                className={`flex flex-col  p-4 ring-2 ring-secondary-600 ring-opacity-40    ${
                  is_full_screen
                    ? 'inset-0 fixed z-40 bg-dark-42 gap-2'
                    : 'bg-secondary-600 bg-opacity-10 rounded-xl gap-4 '
                } `}
              >
                <h2 className={'font-bold	text-secondary-200 text-4xl flex items-center justify-between'}>
                  <span className={'bg-secondary-200 bg-opacity-20 p-2 rounded-xl'}>id: {room_id} </span>{' '}
                  <Button
                    isContained
                    isSecondary
                    onClick={() => {
                      set_is_full_screen((p) => !p);
                    }}
                  >
                    <svg className={'h-full w-6 '} viewBox='0 0 24 24' fill={'currentColor'}>
                      <path
                        d={
                          is_full_screen
                            ? 'M22 3.41 16.71 8.7 20 12h-8V4l3.29 3.29L20.59 2 22 3.41zM3.41 22l5.29-5.29L12 20v-8H4l3.29 3.29L2 20.59 3.41 22z'
                            : 'M21 11V3h-8l3.29 3.29-10 10L3 13v8h8l-3.29-3.29 10-10z'
                        }
                      ></path>
                    </svg>
                  </Button>
                </h2>
                <div className={'flex flex-col gap-2'}>
                  {state.is_timer_started ? (
                    <div
                      className={`flex items-center   justify-between ${
                        is_full_screen
                          ? ''
                          : ' p-2 rounded-2xl bg-secondary-200 bg-opacity-20 ring-2 ring-secondary-400 ring-opacity-40'
                      }  `}
                    >
                      <div
                        className={`flex ${
                          is_full_screen
                            ? 'mb-2 m gap-4 bg-primary-200 bg-opacity-20 p-2 rounded-xl'
                            : 'flex-col  gap-2'
                        }`}
                      >
                        <h2
                          className={`font-bold	 ${
                            is_full_screen ? 'text-primary-200 text-4xl' : 'text-secondary-200 text-2xl '
                          }`}
                        >
                          Team: {timer_propertyies.team_move_name},
                        </h2>
                        <h2
                          className={`font-bold	 ${
                            is_full_screen ? 'text-primary-200 text-4xl' : 'text-secondary-200 text-2xl '
                          }`}
                        >
                          Left: {get_time_left()}
                        </h2>
                      </div>
                      <Button
                        isSecondary={!is_full_screen}
                        p={'p py-2 px-4 '}
                        _class={'text-4xl font-bold '}
                        onClick={() => {
                          clearInterval(state.interval);
                          set_next_team_move();
                          const interval = start_timer();

                          setState({ ...state, is_timer_started: true, interval });
                        }}
                        rounded={'2xl'}
                      >
                        <svg viewBox='0 0 24 24' className={'w-10 h-10'} fill={'currentcolor'}>
                          <path d='M16.01 11H4v2h12.01v3L20 12l-3.99-4z'></path>
                        </svg>
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={`
                        flex gap-2 flex-col bg-secondary-100 bg-opacity-20 ring-2 ring-secondary-400 ring-opacity-40  p-2 justify-center rounded-2xl  `}
                    >
                      <h2 className={'font-bold	text-secondary-100 text-3xl'}>Chouse order of team moving:</h2>
                      <div className={'flex gap-2 items-center flex-wrap'}>
                        {Object.entries(state.teams).map(([name, _color]) => {
                          const is_active = state.team_move_order.includes(name);
                          const background = is_active ? 'transparent' : _color;
                          const color = is_active ? _color : 'transparent';

                          return (
                            <button
                              key={'chose' + name}
                              className={'rounded-2xl w-20 h-20 flex items-center justify-center font-bold text-2xl '}
                              onClick={() =>
                                setState((state) => ({
                                  ...state,
                                  team_move_order: state.team_move_order.includes(name)
                                    ? state.team_move_order.filter((_) => _ !== name)
                                    : [...state.team_move_order, name],
                                }))
                              }
                              style={{ background, border: '4px solid ', borderColor: 'currentcolor', color }}
                            >
                              {is_active && state.team_move_order.findIndex((__) => __ === name) + 1}
                            </button>
                          );
                        })}
                        {state.team_move_order.length === Object.keys(state.teams).length && (
                          <Button
                            _class={'h-20'}
                            isSecondary
                            rounded={'2xl'}
                            isContained
                            onClick={() => {
                              const interval = start_timer();
                              setState({ ...state, is_timer_started: true, interval });
                            }}
                          >
                            Ready for start!
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {awaiting_users.map((id) => (
                    <div
                      key={id}
                      className={
                        'flex  gap-2  bg-secondary-200 bg-opacity-20 p-2 rounded-xl  justify-between items-center'
                      }
                    >
                      <h2 className={'font-bold	text-secondary-100 text-1xl'}>{id}</h2>
                      <div className={'flex gap-1 items-center'}>
                        <button onClick={() => handle_reject_user(id)}>{close_svg}</button>
                        <button onClick={() => handle_resolve_user(id)}>{success_svg}</button>
                      </div>
                    </div>
                  ))}
                </div>

                {state.is_timer_started && (
                  <Board
                    count_of_each_team_fields={state.count_of_each_team_fields}
                    board={state.board}
                    is_full_screen={is_full_screen}
                    room_id={room_id}
                    set_winner={set_winner}
                    winner={winner}
                    {...default_props}
                    activated_fields={state.activated_fields}
                    on_click_of_death={() => {
                      set_is_wasted(true);
                    }}
                    on_click_of_placeholder={() => {
                      clearInterval(state.interval);
                      set_next_team_move();
                      const interval = start_timer();
                      setState({ ...state, interval });

                      toast('Placeholder was actived, next team have to move  ', { theme: 'colored', type: 'info' });
                    }}
                  />
                )}
                {!!connected_users.length && (
                  <div
                    className={`
                  
                  ${
                    is_full_screen
                      ? 'bg-primary-200 bg-opacity-20 p-2 rounded-xl  flex-wrap items-center justify-between'
                      : ' flex-col'
                  }
                  
                  flex gap-2  rounded-2xl`}
                  >
                    <h4 className={'font-bold	text-primary-200 text-2xl'}> Connected users (click to remove)</h4>
                    <div className={'flex flex-wrap gap-1 '}>
                      {connected_users.map((id) => {
                        return (
                          <button
                            key={id}
                            onClick={() => handle_reject_user(id)}
                            className={
                              'text-primary-300 rounded-xl border-2 border-primary-2  p-2 hover:bg-primary-300 hover:text-dark-42 hover:bg-opacity-60'
                            }
                          >
                            {id}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
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
                      {
                        key: 'time_to_move',
                        title: `${state.time_to_move} minutes  to move`,
                        min: 1,
                        max: 10,
                      },
                    ].map(({ key, title, ...props }) => (
                      <div
                        className={'flex flex-col gap-1 border-b-2 border-secondary-300 pb-4 border-opacity-40'}
                        key={key}
                      >
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
                    <div className={'flex  gap-4 items-center border-b-2 border-secondary-300 pb-4 border-opacity-40'}>
                      <input
                        className={'transform scale-150 '}
                        type={'checkbox'}
                        checked={state.is_death_field_includes}
                        onChange={({ target: { checked } }) =>
                          setState((state) => ({ ...state, is_death_field_includes: checked }))
                        }
                      />
                      <h4 className={'text-secondary-100 text-2xl font-bold rounded-md'}>Is death field includes?</h4>
                    </div>

                    <div className={'flex flex-col gap-2'}>
                      <h4 className={'text-secondary-100 text-2xl font-bold'}>Teams</h4>
                      {Object.entries(state.teams).map(([name, color]) => (
                        <button
                          style={{ borderColor: color }}
                          onClick={() => {
                            //@ts-ignore
                            delete state.teams[name];
                            handle_creating_or_editing_team({ name, color });
                          }}
                          className={
                            'border-2 rounded-2xl flex gap-2 items-center p-2 hover:bg-secondary-200 hover:bg-opacity-20'
                          }
                          key={name + color}
                        >
                          <div style={{ background: color }} className={'rounded-full w-10 h-10'}></div>
                          <h4 className={'font-bold	text-secondary-200 text-sm'}>{name}</h4>
                        </button>
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
                              autoFocus
                              placeholder={'Name...'}
                              className={
                                'font-bold	text-secondary-200 text-sm bg-opacity-0 bg-primary-100 p-2  rounded-xl'
                              }
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
                        handle_creating_or_editing_team(nullity_of_new_team_properties);
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
      )}
    </>
  );
};

export default Home;
