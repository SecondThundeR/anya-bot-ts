aidenPower =
    .enabled = Сила админов в деле! Теперь я не буду удалять запрещенный контент, отправленный ими
    .disabled = Чувствуете? Сила админов кажется исчезла :( Теперь я буду удалять запрещенный контент, отправленный ими

aidenPierce =
    .disabled = Отключен режим "Эйдена Пирса"
    .enabled = Активирован режим "Эйдена Пирса"
    .silentDisabled = Отключен тихий режим "Эйдена Пирса"
    .silentEnabled = Активирован тихий режим "Эйдена Пирса"
    .quote-1 = Haven't you heard? I'm the vigilante. I clean up mess like you.
    .quote-2 = You're the only problem I see now. And I'm coming for you.
    .quote-3 = Hey Bagley? Shut up.
    .quote-4 = Some fights are worth losing for.
    .quote-5 = You're a smart man, you should know when you're beaten.
    .quote-6 = How's your memory now? Better?
    .quote-7 =
        In my neighborhood, you stood up or you got beat down...
        So I stood up. I ran with an ugly crowd. Learned how to fight. How to shoot.
        I paid for it too. I took the hits so my family wouldn't have to.
        Mom always said we escaped Dad when we left him back in Belfast.
        She only wanted peace for us and he was always fighting for something.
        She saw that fire in me, too. She said her sweet little boy was gone -
        I'd turned into Dad. That should have stung, but it didn't. I was proud to hear it.

cmdUsage =
    .noUsageData = Нет данных по использованию команд
    .messageHeader = Данные по использованию команд:
    .usageMessage = <code>{ $name }</code>: <b>{ $count } раз(а)</b>

diceGameMessages =
    .empty = Напишите число и текст после него
    .noTextProvided = Вы не передали текст после числа
    .notANumber = Вы передали не число. Попробуйте еще раз!
    .wrongNumber = Вы передали неверное число. Допустимые значения: от 1 до 6
    .message = Если падает { $number }, то { $text }

help =
    .description = Расскажу, что я умею
    .groupMessage = Я могу делать такие вещи:
    /help - расскажу, что я умею
    /silent - не буду говорить после каждого удаленного стикера
    /aidenmode - контролирует удаление голосовых/видео сообщений
    /aidensilent - не буду говорить после каждого удаленного голосовых/видеосообщения
    /dice - отправлю сообщение с кубиком
    /noemoji - контролирует строгость удаления кастомных эмодзи (beta)
    /adminpower - позволяет отправлять администраторам запрещенный контент
    /silentonlocale <code>текст</code> - буду говорить это, когда вы разрешите мне говорить о стикерах
    /silentonlocalereset - буду говорить как прежде, когда вы разрешите мне говорить о стикерах
    /silentofflocale <code>текст</code> - буду говорить это, когда мне не стоит говорить о стикерах
    /silentofflocalereset - буду говорить как прежде, когда мне не стоит говорить о стикерах
    /messagelocale <code>текст</code> - буду говорить это, когда увижу любой плохой стикер
    /messagelocalereset - буду говорить как прежде, когда увижу любой плохой стикер
    .pmMessage = Я могу делать такие вещи:
    /help - расскажу, что я умею
    /addwl <code>айди</code> - добавлю этот айди в список хороших чатов
    /remwl <code>айди</code> - удалю айди чата из списка хороших чатов
    /silentremwl <code>айди</code> - тихо удалю айди чата из списка хороших чатов
    /getwl - покажу все хорошие чаты и айди
    /addil <code>айди</code> - добавлю этот айди в список плохих чатов
    /remil <code>айди</code> - удалю этот айди их списка плохих чатов
    /getil - покажу все айди плохих чатов
    /getcmdusage - покажу количество использований команд за всё время работы бота
    /export - экспортирую данные из базы данных в .dump файл
    /uptime - покажу сколько времени я уже работаю

ignoreListMessages =
    .added = Хорошо, теперь я буду игнорировать этот чат!
    .removed = Отлично, теперь я не буду игнорировать этот чат!
    .alreadyAdded = Я давно уже игнорирую этот чат!
    .alreadyRemoved = Я и так не игнорирую этот чат!
    .addedAndUnwhitelisted = Я убрала этот чат из списка хороших чатов и теперь игнорирую его!
    .keyboardAdded = Хорошо, я теперь игнорирую этот чат!
    .chatMessage = Простите, но этот чат был добавлен в список игнорируемых чатов! Я не могу тут находиться, поэтому мне придется уйти
    .idsListHeader = Айди чатов, которые я игнорирую:
    .idsListEmpty = Пока я не записала ни одного айди чата, которые я буду игнорировать

importMessages =
    .wrongFormat = Неверный формат файла. Необходимо отправить .dump файл
    .confirmation = Восстановить базу данных из этого файла? Текущие данные будут полностью заменены
    .buttonConfirm = Восстановить
    .buttonCancel = Отмена
    .cancelled = Восстановление отменено, база данных не изменена
    .expired = Время на подтверждение истекло. Отправьте файл заново
    .inProgress = Идет импортирование данных...
    .success = Успешно импортировано!
    .error = Произошла ошибка при импортировании данных! Выполняется откат импорта. Детали:
    <code>{ $errorMessage }</code>
    .unknownError = Произошла неизвестная ошибка при импортировании данных! Выполняется откат импорта

exportMessages =
    .dumpError = Ошибка при экспортировании данных! (Exitcode: { $exitCode }, Stderr: { $stderr })
    .unknownError = Произошла неизвестная ошибка при экспортировании данных!

keyboardMessages =
    .buttonYes = Да
    .buttonNo = Нет
    .buttonIgnore = Игнорировать
    .keyboardError = Не удалось обработать операцию. Скорее всего бот был забанен или кикнут из чата

nicknameGenerator =
    .tooLong = Длина никнейма слишком большая
    .title = Сгенерировать никнейм
    .titleWithLength = Сгенерировать никнейм с длинной { $length }
    .messageText = Сгенерированный никнейм: <code>{ $nickname }</code>
    .description = Стиль ubdjshdb

noEmoji =
    .enabled = Теперь я буду удалять все кастомные эмодзи
    .disabled = Теперь я не буду удалять все кастомные эмодзи

otherMessages =
    .callbackSuccess = Операция выполнена успешно!
    .callbackFailure = Операция выполнена с ошибками!
    .callbackWrongUser = Вы не запрашивали изменение текста!
    .unknownUser = неизвестный пользователь
    .stringIsEmpty = Вы не передали мне, что же говорить вместо тех слов!
    .noChatIDProvided = Вы не передали мне айди чата!
    .noPMHint = Простите, но я не работаю в личных чатах. Чтобы начать со мной работу, добавьте меня в общий чат
    .creatorPMHint = Добро пожаловать! Используйте команду /help, чтобы узнать больше о командах для управления ботом
    .botGreeting = Привет! Спасибо, что добавили меня.
    .botAdminHint = Чтобы я могла бороться в полную силу, мне нужны права на удаление сообщений! Будет здорово, если вы мне выдадите их
    .botAdminNote = Теперь я могу бороться со стикерами в полную силу!
    .uptimeMessage = Текущее время работы:

silentMessages =
    .enabledDefault = Поняла! Теперь я буду бороться со стикерами в тишине
    .disabledDefault = Ура! Буду говорить обо всех стикерах сразу же
    .enabledMessageChange = Теперь я буду говорить это, когда мне не стоит говорить о стикерах!
    .disabledMessageChange = Теперь я буду говорить это, когда вы разрешите мне говорить о стикерах!
    .enabledMessageReset = Теперь я буду говорить как раньше, когда мне не стоит говорить о стикерах!
    .disabledMessageReset = Теперь я буду говорить как раньше, когда вы разрешите мне говорить о стикерах!

stickerMessages =
    .messageDefault = мой папа говорит, что такие стикеры используют плохие дяди!
    .messageReset = Хорошо, теперь я буду говорить как прежде, когда увижу любой плохой стикер
    .messageWithMentionChanged = Хорошо, теперь я буду говорить это,
    .mentionModeYes = а также упоминать того, кто отправил стикер
    .mentionModeNo = а также не упоминать того, кто отправил стикер
    .mentionQuestion = Хорошо, теперь я буду говорить так. Однако, стоит ли мне упоминать того, кто отправил стикер?
    .noTextProvided = Вы не сказали, что мне говорить!
    .timeoutError = Новый текст я запомнила, но ответа насчет упоминания я не услышала, поэтому оставила упоминание как было. Если хотите его поменять, отправьте запрос через команду еще раз
    .inProgress = Я уже учу новый текст, попробуйте позже или подождите, пока прошлый запрос завершится

whiteListMessages =
    .added = Ура, теперь я могу работать в этом чате!
    .removed = Хорошо, теперь я не буду работать в этом чате!
    .alreadyAdded = Я давно могу работать в этом чате!
    .alreadyRemoved = Я и так не могу работать в этом чате!
    .addedAndUnignored = Я убрала этот чат из списка плохих чатов и теперь могу работать в нём!
    .keyboardAdded = Поняла, теперь я могу работать в этом чате!
    .keyboardRemoved = Хорошо, я теперь не буду работать в этом чате!
    .newChatInfo = Меня хочет добавить { $user } в чат { $chat }! Можно ли мне там работать?
    .chatMessage = Привет. К сожалению, пока что я не могу у вас работать, так как я не знаю этот чат, поэтому я буду просто игнорировать все сообщения
    .accessRevoked = Привет. К сожалению, мне отозвали разрешение на работу в этом чате и сейчас я буду просто игнорировать все сообщения
    .accessGranted = Ура! Мне дали разрешение на работу в этом чате! Теперь я смогу помогать вам удалять премиум стикеры.
    .chatsListHeader = Я сейчас работаю в:
    .idsListHeader = Я запомнила такие айди чатов:
    .empty = Пока я не записала ни одного айди чата, в которых я могу работать.

general =
    .commandsUpdated = Команды были обновлены

start =
    .description = Начать работу с ботом

setcommands =
    .description = Обновить список команд бота

addwl =
    .description = Добавить чат в список хороших чатов

remwl =
    .description = Удалить чат из списка хороших чатов

silentremwl =
    .description = Тихо удалить чат из списка хороших чатов

getwl =
    .description = Показать все хорошие чаты и айди

addil =
    .description = Добавить чат в список плохих чатов

remil =
    .description = Удалить чат из списка плохих чатов

getil =
    .description = Показать все айди плохих чатов

getcmdusage =
    .description = Показать количество использований команд

export =
    .description = Экспортировать данные из базы данных в .dump файл

uptime =
    .description = Показать время работы бота

adminpower =
    .description = Разрешить администраторам отправлять запрещенный контент

aidenmode =
    .description = Управлять удалением голосовых/видеосообщений

aidensilent =
    .description = Не говорить после каждого удаленного голосового/видеосообщения

dice =
    .description = Отправить сообщение с кубиком

messagelocale =
    .description = Изменить текст при удалении плохого стикера

messagelocalereset =
    .description = Вернуть стандартный текст при удалении плохого стикера

noemoji =
    .description = Управлять строгостью удаления кастомных эмодзи

silent =
    .description = Не говорить после каждого удаленного стикера

silentonlocale =
    .description = Изменить текст для разрешения говорить о стикерах

silentonlocalereset =
    .description = Вернуть стандартный текст для разрешения говорить о стикерах

silentofflocale =
    .description = Изменить текст для тихого режима

silentofflocalereset =
    .description = Вернуть стандартный текст для тихого режима
