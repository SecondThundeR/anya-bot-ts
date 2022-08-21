import IOtherMessages from '../../interfaces/locale/IOtherMessages';

const otherMessages: IOtherMessages = {
    callbackSuccess: 'Операция выполнена успешно!',
    callbackFailure: 'Операция выполнена с ошибками!',
    callbackWrongUser: 'Вы не запрашивали изменение текста!',
    unknownUser: 'неизвестный пользователь',
    stringIsEmpty: 'Вы не сказали мне, что же говорить вместо тех слов!',
    noChatIDProvided: 'Вы не сказали мне айди чата!',
    noPMHint:
        'Простите, но я не работаю в личных чатах. Добавьте меня в общий чат, и я буду работать в нем.',
    botAdminHint:
        'Спасибо, что добавили меня! Проверьте, чтобы я точно могла удалять сообщения, чтобы борьба со стикерами была успешной',
    botAdminWhitelistedHint:
        'Еще вижу, у меня нет прав на удаление стикеров! Дайте мне их пожалуйста :(',
    creatorLink: '@someusername' // TODO: Change this username, because it used in noAccess message
};

export default otherMessages;
