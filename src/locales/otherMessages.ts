const otherMessages = {
    callbackSuccess: "Операция выполнена успешно!",
    callbackFailure: "Операция выполнена с ошибками!",
    callbackWrongUser: "Вы не запрашивали изменение текста!",
    unknownUser: "неизвестный пользователь",
    stringIsEmpty: "Вы не передали мне, что же говорить вместо тех слов!",
    noChatIDProvided: "Вы не передали мне айди чата!",
    noPMHint:
        "Простите, но я не работаю в личных чатах. Чтобы начать со мной работу, добавьте меня в общий чат.",
    creatorPMHint:
        "Добро пожаловать! Используйте команду /help, чтобы узнать больше о командах для управления ботом",
    botGreeting: "Привет! Спасибо, что добавили меня.",
    botAdminHint:
        "Чтобы я могла бороться в полную силу, мне нужны права на удаление сообщений! \
Будет здорово, если вы мне выдадите их",
    botAdminNote: "Теперь я могу бороться со стикерами в полную силу!",
    uptimeMessage: "Текущее время работы:",
    unknownError:
        "<b>Произошла неизвестная ошибка!</b> Детали: <code>{error}</code>",
    unknownErrorForCreator:
        '<b>Произошла неизвестная ошибка в чате "{chatName}" ({chatID})!</b> Детали: <code>{error}</code>',
    creatorMsg: "Бот запущен и готов к работе!",
    noCreatorLink: "нет ссылки :(",
} as const;

export default otherMessages;
