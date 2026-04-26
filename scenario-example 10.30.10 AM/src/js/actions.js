// js/actions.js - Отправка команд на фронтенд
// ✅ Формат для @salutejs/client@1.32.0

function sendActionToApp(action, context) {
    log('📤 [ACTIONS] Отправка action: ' + JSON.stringify(action));
    
    // Инициализируем массив ответов
    if (!context.response.replies) {
        context.response.replies = [];
    }
    
    // ✅ Формат 1: Прямой (для createSmartappDebugger)
    context.response.replies.push({
        type: "smart_app_data",
        action: action
    });
    
    // ✅ Формат 2: Через items (для совместимости)
    context.response.replies.push({
        type: "raw",
        body: {
            items: [{
                command: {
                    type: "smart_app_data",
                    action: action
                }
            }]
        }
    });
    
    log('📤 [ACTIONS] Добавлено 2 формата ответа');
}

function setTimer(durationSeconds, context) {
    var duration = Number(durationSeconds) || 5;
    log('⏱ [ACTIONS] setTimer вызван: ' + duration + ' сек');
    
    sendActionToApp({ 
        type: "set_timer", 
        duration: duration 
    }, context);
}

function cancelTimer(context) {
    log('🛑 [ACTIONS] cancelTimer вызван');
    sendActionToApp({ type: "cancel_timer" }, context);
}

// ❌ НЕ добавляй module.exports — в SmartApp он ломает сборку!