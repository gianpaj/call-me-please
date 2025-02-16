interface PromptInputs {
  currenTime: string;
  alarmTime?: string;
}

export const SYSTEM_MESSAGES = {
  en: (promptInputs: PromptInputs) =>
    `It's ${promptInputs.currenTime}, ${promptInputs.alarmTime ? `the user set an alarm for ${promptInputs.alarmTime}` : ""}. Follow the user's instructions:`,
};
