function novoElemento(tagName, className) {
    const el = document.createElement(tagName)
    el.className = className

    return el
}


class barreira {
    constructor(reversa = false) {
        this.elemento = novoElemento('div', 'barreira')

        const borda = novoElemento('div', 'borda')
        const corpo = novoElemento('div', 'corpo')

        this.elemento.appendChild(reversa ? corpo : borda)
        this.elemento.appendChild(reversa ? borda : corpo)

        this.setAltura = altura => corpo.style.height = `${altura}px`
    }
}

class parDeBarreiras {
    constructor(altura, abertura, x) {
        this.elemento = novoElemento('div', 'par-de-barreiras')

        this.superior = new barreira(true)
        this.inferior = new barreira(false)

        this.elemento.appendChild(this.superior.elemento)
        this.elemento.appendChild(this.inferior.elemento)

        this.posicaoAbertura = () => {
            const alturaSuperior = Math.random() * (altura - abertura)
            const alturaInferior = altura - abertura - alturaSuperior
            this.superior.setAltura(alturaSuperior)
            this.inferior.setAltura(alturaInferior)
        }
        this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
        this.setX = x => this.elemento.style.left = `${x}px`
        this.getLargura = () => this.elemento.clientWidth

        this.posicaoAbertura()
        this.setX(x)
    }
}

class barreiras {
    constructor(altura, largura, abertura, espaco, pontos) {
        this.pares = [
            new parDeBarreiras(altura, abertura, largura),
            new parDeBarreiras(altura, abertura, largura + espaco),
            new parDeBarreiras(altura, abertura, largura + espaco * 2),
            new parDeBarreiras(altura, abertura, largura + espaco * 3)
        ]

        const deslocamento = 3
        this.animar = () => {
            this.pares.forEach(par => {
                par.setX(par.getX() - deslocamento)

                if (par.getX() < -par.getLargura()) {
                    par.setX(par.getX() + espaco * this.pares.length)
                    par.posicaoAbertura()
                }

                const meio = largura / 2
                const cruzouBarreira = par.getX() + deslocamento >= meio && par.getX() < meio
                if (cruzouBarreira) {
                    pontos()
                }
            })
        }
    }
}

class passaro {
    constructor(alturaJogo) {
        let voando = false

        this.elemento = novoElemento('img', 'passaro')
        this.elemento.src = 'imgs/passaro.png'
        
        this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
        this.setY = y => this.elemento.style.bottom = `${y}px`

        window.onkeydown = e => voando = true
        window.onkeyup = e => voando = false

        this.animar = () => {
            const novoY = this.getY() + (voando ? 8 : -5)
            const alturaMaxima = alturaJogo - this.elemento.clientHeight

            if(novoY <= 0) {
                this.setY(0)
            }else if (novoY >= alturaMaxima) {
                this.setY(alturaMaxima)
            }else {
                this.setY(novoY)
            }
        }
        
        this.setY(alturaJogo / 2)
    }
}

// const obstaculos = new barreiras(700, 1200, 350, 400)
// const bird = new passaro(700)
// const areaDoJogo = document.querySelector('[wm-flappy]')

// areaDoJogo.appendChild(bird.elemento)
// obstaculos.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
// setInterval(() => {
//     obstaculos.animar()
//     bird.animar()
// }, 20)

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false 
    barreiras.pares.forEach(parDeBarreiras => {
        if(!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior) || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

class progresso {
    constructor() {
        this.elemento = novoElemento('span', 'progresso')
        this.atualizarPontos = pontos => {
            this.elemento.innerHTML = pontos
        }
        this.atualizarPontos(0)
    }
}

class flappyBird {
    constructor() {
        let pontos = 0

        const areaDoJogo = document.querySelector('[wm-flappy]')
        const altura = areaDoJogo.clientHeight
        const largura = areaDoJogo.clientWidth

        const pontuacao = new progresso()
        const obstaculos = new barreiras(altura, largura, 200, 400,
            () => pontuacao.atualizarPontos(++pontos))
        const bird = new passaro(altura)

        areaDoJogo.appendChild(pontuacao.elemento)
        areaDoJogo.appendChild(bird.elemento)
        obstaculos.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

        this.start = () => {
            const temporizador = setInterval(() => {
                obstaculos.animar()
                bird.animar()

                if(colidiu(bird,obstaculos)) {
                    clearInterval(temporizador)
                }
            }, 20)
        }
    }
}

new flappyBird().start()


