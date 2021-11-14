import { FC } from 'react';

const HeaderText: FC = () => {
  const text = !window
    ? 'Catena game'
    : window.innerWidth < 400
    ? ''
    : window.innerWidth < 600
    ? 'Catena'
    : 'Catena game';

  return <span>{text}</span>;
};
export default HeaderText;
