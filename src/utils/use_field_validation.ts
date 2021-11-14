export const use_field_validation = (field: string, teams: { [key: string]: string }): string => {
  const is_death = field === 'DEATH';
  const is_placeholder = field === 'PLACEHOLDER';
  const background = is_death ? 'red' : is_placeholder ? 'transparent' : teams[field];

  return background;
};
