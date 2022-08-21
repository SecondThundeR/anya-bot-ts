import IIgnoreListMessages from '../../interfaces/locale/IIgnoreListMessages';
import otherMessages from './otherMessages';

const ignoreListMessages: IIgnoreListMessages = {
    added: 'Хорошо, теперь я буду игнорировать этот чат!',
    removed: 'Отлично, теперь я не буду игнорировать этот чат!',
    alreadyAdded: 'Я давно уже игнорирую этот чат!',
    addedAndUnwhitelisted:
        'Я теперь игнорирую этот чат, а также я убрала его из списка хороших чатов!',
    keyboardAdded: 'Хорошо, я теперь игнорирую этот чат!',
    alreadyRemoved: 'Я и так не игнорирую этот чат!',
    noAccess: `Простите, но этот чат был добавлен в список игнорируемых чатов! Я не могу тут находиться, поэтому мне придется уйти. Если хотите узнать в чем дело, напишите моему создателю: ${otherMessages.creatorLink} (Укажите этот айди: xxx, когда будете обращаться к нему, чтобы быстрее разобраться)`,
    idsInfo: 'Айди чатов, которые я игнорирую:\n',
    listEmpty:
        'Пока я не записала ни одного айди чата, которые я буду игнорировать.'
};

export default ignoreListMessages;
