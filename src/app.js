import './style.scss'
import * as tf from './app/modules.js'

window.onload = function() {
    console.log('Приложение загружено')
    let repo = tf.generateRepo()
    let strInput = document.getElementById('strInp')
    let strResultEl = document.getElementById('balance')
    let repoResultEl = document.getElementById('targetID')
    let repoBtn =  document.getElementById('repoBtn')
    let emuChx =  document.getElementById('emuChx')
    let isSearching = false
    document.querySelector('.reBtn').addEventListener('click', () => {
        document.querySelector('.repo').innerHTML = ''
        repoResultEl.innerText = 'не найден'
        isSearching = false
        repoBtn.innerText = 'Найти'
        repoBtn.classList.remove('disabled')
        repoBtn.classList.remove('complete')
        repo = tf.generateRepo()
    })
    document.getElementById('strBtn').addEventListener('click', () => {
        let res = tf.checkString(strInput.value)
        strResultEl.classList.remove(!res)
        strResultEl.classList.add(res)
        strResultEl.innerText = res
        console.log(`Результат проверки строки "${strInput.value}" — ${res}`)
    })
    repoBtn.addEventListener('click', () => {
        if (isSearching) return
        isSearching = true
        repoBtn.classList.add('disabled')
        repoBtn.innerText = 'Поиск...'
        tf.checkRepo(repo, emuChx.checked)
            .then((result) => {
                repoResultEl.innerText = result
                document.getElementById(`com${result}`).classList.add('target')
                repoBtn.classList.remove('disabled')
                repoBtn.classList.add('complete')
                repoBtn.innerText = 'Готово!'
            })
            .catch((error) => {
                repoResultEl.innerText = error
                repoBtn.classList.remove('disabled')
                repoBtn.classList.add('complete')
                repoBtn.innerText = 'Готово!'
            })
    })
}
