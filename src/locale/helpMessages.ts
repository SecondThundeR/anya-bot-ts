const helpMessages = {
    groupMessage:
        "Я могу делать такие вещи:\n" +
        "/help - расскажу, что я умею\n" +
        "/silent - не буду говорить после каждого удаленного стикера\n" +
        "/aidenmode - контролирует удаление голосовых/видео сообщений\n" +
        "/aidensilent - не буду говорить после каждого удаленного голосовых/видеосообщения\n" +
        "/dice - отправлю сообщение с кубиком\n" +
        "/noemoji - контролирует строгость удаления кастомных эмодзи (beta)\n" +
        '/adminpower - позволяет отправлять администраторам "запрещенный" контент\n' +
        "/silentonlocale [текст] - буду говорить это, когда вы разрешите мне говорить о стикерах\n" +
        "/silentonlocalereset - буду говорить как прежде, когда вы разрешите мне говорить о стикерах\n" +
        "/silentofflocale [текст] - буду говорить это, когда мне не стоит говорить о стикерах\n" +
        "/silentofflocalereset - буду говорить как прежде, когда мне не стоит говорить о стикерах\n" +
        "/messagelocale [текст] - буду говорить это, когда увижу любой плохой стикер\n" +
        "/messagelocalereset - буду говорить как прежде, когда увижу любой плохой стикер",
    pmMessage:
        "Я могу делать такие вещи:\n" +
        "/help - расскажу, что я умею\n" +
        "/addwhitelist [айди] - добавлю этот айди в список хороших чатов\n" +
        "/removewhitelist [айди] - удалю этот айди из списка хороших чатов\n" +
        "/getwhitelist - покажу все хорошие чаты и айди\n" +
        "/addignorelist [айди] - добавлю этот айди в список плохих чатов\n" +
        "/removeignorelist [айди] - удалю этот айди их списка плохих чатов\n" +
        "/getignorelist - покажу все айди плохих чатов\n" +
        "/getcommandsusage - покажу количество использований команд за всё время работы бота\n" +
        "/uptime - покажу сколько времени я уже работаю"
};

export default helpMessages;
