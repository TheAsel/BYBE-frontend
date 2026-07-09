export type party = {
  advanced: boolean;
  name: string;
  level: number;
  size: number;
  members: {
    name: string;
    level: number;
  }[];
};
