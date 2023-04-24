function novoElemento(tipo, classe) {
    const elemento = document.createElement(tipo)
    elemento.classList.add(classe)

    return elemento
}

function novoBotao(tipo, classe) {
    const divContainerBotao = document.createElement('div')
    divContainerBotao.classList.add('container-botao')

    const botao = document.createElement(tipo)
    botao.classList.add(classe)

    divContainerBotao.appendChild(botao)

    return divContainerBotao
}

function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const corpo = novoElemento('div', 'corpo')
    const borda = novoElemento('div', 'borda')

    this.elemento.appendChild(reversa ? borda : corpo)
    this.elemento.appendChild(reversa ? corpo : borda)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira()
    this.inferior = new Barreira(true)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior

        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`

    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 1
    this.animar = () => {
        this.pares.forEach(par => {

            // quando o elemento sair da área do jogo
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            par.setX(par.getX() - deslocamento)
            const meio = largura / 2 - 160
            const cruzouMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio

            if (cruzouMeio) notificarPonto()
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const isMobile = altura > largura

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = './imgs/gato.png'

    if (isMobile) {
        this.elemento.style.width = '120px'
    }

    this.getY = () => parseInt(this.elemento.style.bottom.split(`px`)[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => {
        if (e.code == 'Space') {
            voando = true
        }
    };

    window.onkeyup = e => {
        if (e.code == 'Space') {
            voando = false
        }
    };

    document.querySelector('[wm-flappy]').addEventListener('touchstart', () => {
        voando = true
    })

    document.querySelector('[wm-flappy]').addEventListener('touchend', () => {
        voando = false
    })

    document.querySelector('[wm-flappy]').addEventListener("touchcancel", (e) => {
        e.preventDefault()
    });
    document.querySelector('[wm-flappy]').addEventListener("touchleave", (e) => {
        e.preventDefault()
    });
    document.querySelector('[wm-flappy]').addEventListener("touchmove", (e) => {
        e.preventDefault()
    });

    this.animar = () => {
        const novoY = this.getY() + (voando ? isMobile ? 6 : 3 : isMobile ? -4 : -2)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2 - 50)
}

function Progresso() {
    this.contador = novoElemento('div', 'progresso')

    this.atualizarPontos = pontos => {
        this.contador.innerText = pontos
    }

    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left

    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top

    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false

    barreiras.pares.forEach(par => {
        if (!colidiu) {
            const superior = par.superior.elemento
            const inferior = par.inferior.elemento

            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior)
        }

    })

    return colidiu
}


function FlappyBird() {
    let pontos = 0

    this.areaDoJogo = document.querySelector('[wm-flappy]')

    const altura = this.areaDoJogo.clientHeight
    const largura = this.areaDoJogo.clientWidth

    const isMobile = altura > largura
    const espacoEntreBarreiras = isMobile ? 800 : 500

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, isMobile ? 500 : 275, espacoEntreBarreiras, () => {
        progresso.atualizarPontos(++pontos)
    })

    const passaro = new Passaro(altura)
    const divBotaoIniciar = novoBotao('button', 'botao')
    divBotaoIniciar.firstChild.innerHTML = 'Iniciar'

    const divBotaoReiniciar = novoBotao('button', 'botao')
    divBotaoReiniciar.firstChild.innerHTML = 'Reiniciar'
    divBotaoReiniciar.classList.add('reiniciar')

    this.areaDoJogo.appendChild(divBotaoIniciar)
    this.areaDoJogo.appendChild(divBotaoReiniciar)
    this.areaDoJogo.appendChild(passaro.elemento)
    this.areaDoJogo.appendChild(progresso.contador)

    barreiras.pares.forEach(par => {
        this.areaDoJogo.appendChild(par.elemento)
    })

    divBotaoIniciar.firstChild.addEventListener('click', () => {
        divBotaoIniciar.style.display = 'none'
        const bodyBefore = document.styleSheets[1].cssRules[0]
        bodyBefore.parentStyleSheet.cssRules[3].style.opacity = '0'
        passaro.elemento.style.opacity = '1'

        this.start()
    })

    divBotaoReiniciar.firstChild.addEventListener('click', () => {
        divBotaoReiniciar.style.display = 'none'

        const bodyBefore = document.styleSheets[1].cssRules[0]
        bodyBefore.parentStyleSheet.cssRules[3].style.opacity = '0'

        let quantasBarreirasPassaram = 0
        barreiras.pares.forEach(ParDeBarreiras => {

            if (quantasBarreirasPassaram == 0) {
                ParDeBarreiras.setX(largura)
                quantasBarreirasPassaram++
            } else {
                ParDeBarreiras.setX(largura + espacoEntreBarreiras * quantasBarreirasPassaram)
                quantasBarreirasPassaram++
            }

        })

        progresso.contador.innerText = 0
        pontos = 0

        passaro.setY(altura / 2)
        this.start()
    })

    this.start = () => {
        const temporizadorBarreiras = setInterval(() => {
            barreiras.animar()

            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizadorBarreiras)
            }
        }, 1)

        const temporizadorPassaro = setInterval(() => {
            passaro.animar()

            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizadorPassaro)

                divBotaoReiniciar.style.display = 'flex'

                const bodyBefore = document.styleSheets[1].cssRules[0]
                bodyBefore.parentStyleSheet.cssRules[3].style.opacity = '1'
            }
        }, 6)

    }
}

new FlappyBird()