export enum ModelId {
  gpt_4o_realtime = "gpt-4o-realtime",
  gpt_4o_mini_realtime = "gpt-4o-mini-realtime",
}

export interface Model {
  id: ModelId;
  name: string;
}

export const models: Model[] = [
  // {
  //   id: ModelId.gpt_4o_realtime,
  //   name: "gpt-4o-realtime",
  // },
  {
    id: ModelId.gpt_4o_mini_realtime,
    name: "gpt-4o-mini-realtime",
  },
];
