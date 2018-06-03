//Для валидации скобок в строке используем стек
export function checkString(str) {
    //Для начала определимся с перечнем скобок
    let openBr = ['{', '[', '(']
    let closeBr = ['}', ']', ')']
    let foundBr = []
    //Проходим циклом по строке
    for (let i = 0; i < str.length; i++) {
        //Если очередной символ одна из открывающих скобок
        if (openBr.indexOf(str[i]) != -1) {
            //Кладем ее в стек
            foundBr.push(str[i])
            //Если очередной символ - закрывающая скобка
        } else if (closeBr.indexOf(str[i]) != -1) {
            //Проверяем, подходит ли она к последней открывающей скобке
            if (openBr.indexOf(foundBr[foundBr.length - 1]) == closeBr.indexOf(str[i])) {
                //Если да - удаляем из стека последнюю скобку и идем дальше
                foundBr.pop()
            } else {
                //Если нет - сразу понятно, что строка не валидна
                return false
            }
        }
    }

    //В итоге при сбалансированной строке стек будет пуст
    return foundBr.length == 0
}

//для поиска первого плохого коммита используем реализацию на тему бинарного поиска
//с поправкой на то, что мы ищем пару значений [good, bad] или [undefined, bad]
//и на то, что чтение коммита - асинхронная операция
export function checkRepo(repo, emu) {
    //определяем стартовые параметры
    let start = 0, end = repo.length - 1, mid, iter=0, cache = {}

    //функция для эмуляции чтения коммита с рандомным таймаутом до 0.5сек.
    //эмуляцию можно отключить
    function readCommit(repo, id) {
        console.log(`Запрос коммита с ID ${id}`)
        return new Promise(resolve =>
            setTimeout(() => {
                resolve(repo[id])
            }, emu ? Math.random() * 500 : 0)
        )
    }

    return new Promise((resolve, reject) => {

        //проверка на существование репозитория
        if (!repo) reject(new Error('Пустой репозиторий'))
        
        console.log('Начало поиска');

        //для поиска используем рекурсивную функцию
        (function process(){
            iter++
            mid = start + Math.floor((end - start) / 2)
            console.log(`Итерация №${iter}`)

            //проверяем первый элемент отрезка
            //здесь и далее - кэшируем уже запрошенные коммиты, чтобы избежать повторных запросов
            Promise.all([cache[start] || readCommit(repo, start), cache[start-1] || readCommit(repo, start-1)])
                .then((values) => {
                    cache[start] = values[0]
                    cache[start-1] = values[1]
                    if (values[0] == 'bad' && (!values[1] || values[1] == 'good')) {
                        resolve(start)
                    } else {
                        //проверяем последний элемент
                        Promise.all([cache[end] || readCommit(repo, end), cache[end-1] || readCommit(repo, end-1)])
                            .then((values) => {
                                cache[end] = values[0]
                                cache[end-1] = values[1]
                                if (values[0] == 'bad' && values[1] == 'good') {
                                    resolve(end)
                                } else {
                                    //проверяем середину отрезка
                                    Promise.all([cache[mid] || readCommit(repo, mid), cache[mid-1] || readCommit(repo, mid-1)])
                                        .then((values) => {
                                            cache[mid] = values[0]
                                            cache[mid-1] = values[1]
                                            if (values[0] == 'bad' && (!values[1] || values[1] == 'good')) {
                                                resolve(mid)
                                            } else {
                                                //если искомый элемент не найден - находим следующий отрезок для поиска
                                                Promise.all([cache[start] || readCommit(repo, start), cache[mid] || readCommit(repo, mid), cache[end] || readCommit(repo, end)])
                                                    .then((values) => {
                                                        cache[start] = values[0]
                                                        cache[mid] = values[1]
                                                        cache[end] = values[2]
                                                        if (values[0] == 'good' && values[1] == 'bad') {
                                                            end = mid - 1
                                                        } else if(values[1] == 'good' && values[2] == 'bad') {
                                                            start = mid + 1
                                                        }
                                                        process()
                                                    })
                                            }
                                        })
                                }
                            })
                    }
                })
        })()
    })
}

//функция генерации "репозитория"
export function generateRepo() {
    console.log('Генерируем случайный "репозиторий"')
    //генерируем случайный размер от 0 до 100
    let repoSize = Math.floor(Math.random() * 101)
    document.getElementById('repoSize').innerText = repoSize
    console.log(`Размер репозитория: ${repoSize}`)

    //генерируем случаный старт "плохих" коммитов
    let badPoint = Math.floor(Math.random() * repoSize)
    console.log(`Первый плохой коммит: ${badPoint}`)

    //генерируем сам массив "репозитория" из хороших и плохих "коммитов"
    //и сразу же отрисовываем его на странице
    let container = document.querySelector('.repo')
    let el = document.createElement('div')
    el.className = 'commit'
    let repo = []
    for (let i = 0; i < badPoint; i++) {
        repo.push('good')
        let comel = container.appendChild(el.cloneNode(true))
        comel.classList.add('good')
        comel.innerText = i
        comel.id = `com${i}`
    }
    for (let i = badPoint; i < repoSize; i++) {
        repo.push('bad')
        let comel = container.appendChild(el.cloneNode(true))
        comel.classList.add('bad')
        comel.innerText = i
        comel.id = `com${i}`
    }
    console.log(`Сгенерирован репозиторий:\n[${repo}]`)

    return(repo);
}
