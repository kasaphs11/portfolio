import * as THREE from 'three'

const parameters = {
    materialColor: '#a600ff'
}

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const shapeGroup = new THREE.Group()
scene.add(shapeGroup)

const torusGeometry = new THREE.TorusGeometry(1.35, 0.44, 40, 160)

const material = new THREE.MeshPhysicalMaterial({
    color: parameters.materialColor,
    roughness: 0.18,
    metalness: 0.08,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    sheen: 1,
    sheenColor: '#ffd9ff',
    sheenRoughness: 0.36,
    iridescence: 0.12,
    iridescenceIOR: 1.28,
    emissive: '#240030',
    emissiveIntensity: 0.12
})

const innerMaterial = new THREE.MeshPhysicalMaterial({
    color: '#f2c7ff',
    transparent: true,
    opacity: 0.16,
    roughness: 0.08,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    blending: THREE.AdditiveBlending,
    depthWrite: false
})

const glowMaterial = new THREE.MeshBasicMaterial({
    color: '#bb59ff',
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
})

const mesh = new THREE.Mesh(
    torusGeometry,
    material
)
const innerMesh = new THREE.Mesh(torusGeometry, innerMaterial)
innerMesh.scale.setScalar(0.985)
const glowMesh = new THREE.Mesh(torusGeometry, glowMaterial)
glowMesh.scale.setScalar(1.06)

mesh.add(innerMesh, glowMesh)
shapeGroup.add(mesh)

const hemisphereLight = new THREE.HemisphereLight('#f2d2ff', '#150e21', 2.4)
scene.add(hemisphereLight)

const ambientLight = new THREE.AmbientLight('#ffffff', 0.55)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight('#f6d2ff', 2.8)
directionalLight.position.set(2.6, 2.2, 3.4)
scene.add(directionalLight)

const fillLight = new THREE.PointLight('#7b2dff', 22, 16)
fillLight.position.set(-2.2, -0.8, 2.7)
scene.add(fillLight)

const rimLight = new THREE.DirectionalLight('#9d4dff', 1.8)
rimLight.position.set(-3.8, 1.4, 2.8)
scene.add(rimLight)

const particlesCount = 180
const particlesGeometry = new THREE.BufferGeometry()
const particlePositions = new Float32Array(particlesCount * 3)
const particleSpeeds = new Float32Array(particlesCount)
const particleDrift = new Float32Array(particlesCount)

for(let i = 0; i < particlesCount; i++)
{
    particlePositions[i * 3] = (Math.random() - 0.5) * 12
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 11
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 7 - 1.5
    particleSpeeds[i] = 0.18 + Math.random() * 0.28
    particleDrift[i] = Math.random() * Math.PI * 2
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))

const particlesMaterial = new THREE.PointsMaterial({
    color: '#e4d1ff',
    size: 0.045,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.65,
    depthWrite: false
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 6)
cameraGroup.add(camera)

const getLayoutConfig = () =>
{
    const isMobile = sizes.width <= 900

    if(isMobile)
    {
        return {
            cameraZ: 8.35,
            shapeX: 0,
            shapeY: 0.2,
            shapeScale: 0.74,
            floatAmount: 0.04
        }
    }

    return {
        cameraZ: 6,
        shapeX: 2.25,
        shapeY: 0.22,
        shapeScale: 0.96,
        floatAmount: 0.07
    }
}

const updateLayout = () =>
{
    const layout = getLayoutConfig()

    camera.position.z = layout.cameraZ
    shapeGroup.position.x = layout.shapeX
    shapeGroup.position.y = layout.shapeY
    shapeGroup.scale.setScalar(layout.shapeScale)
}

updateLayout()

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.12

window.addEventListener('resize', () =>
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    updateLayout()

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const pointer = {
    x: 0,
    y: 0
}

let currentPointerType = 'mouse'
const touchDrag = {
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0
}
const touchSpin = {
    x: 0,
    y: 0,
    z: 0
}

const target = {
    rotationX: 0,
    rotationY: 0,
    positionX: 0,
    positionY: 0,
    cameraX: 0,
    cameraY: 0,
    scale: 1
}

const resetInteraction = () =>
{
    pointer.x = 0
    pointer.y = 0
    target.rotationX = 0
    target.rotationY = 0
    target.positionX = 0
    target.positionY = 0
    target.cameraX = 0
    target.cameraY = 0
    target.scale = 1
    touchDrag.velocityX = 0
    touchDrag.velocityY = 0
}

const getInteractionProfile = () =>
{
    if(currentPointerType === 'touch' && touchDrag.active)
    {
        return {
            strength: 1,
            rotationEase: 0.06,
            positionEase: 0.07,
            cameraEase: 0.052,
            scaleEase: 0.06
        }
    }

    if(sizes.width <= 900)
    {
        return {
            strength: 0.6,
            rotationEase: 0.026,
            positionEase: 0.036,
            cameraEase: 0.03,
            scaleEase: 0.034
        }
    }

    return {
        strength: 1,
        rotationEase: 0.022,
        positionEase: 0.03,
        cameraEase: 0.025,
        scaleEase: 0.03
    }
}

const setPointer = (clientX, clientY, pointerType = 'mouse') =>
{
    currentPointerType = pointerType || 'mouse'
    const interactionProfile = getInteractionProfile()

    pointer.x = clientX / sizes.width - 0.5
    pointer.y = clientY / sizes.height - 0.5

    target.rotationY = pointer.x * 0.9 * interactionProfile.strength
    target.rotationX = pointer.y * 0.5 * interactionProfile.strength
    target.positionX = pointer.x * 0.18 * interactionProfile.strength
    target.positionY = - pointer.y * 0.14 * interactionProfile.strength
    target.cameraX = pointer.x * 0.05 * interactionProfile.strength
    target.cameraY = - pointer.y * 0.04 * interactionProfile.strength
    target.scale = 1 + (Math.abs(pointer.x) * 0.015 + Math.abs(pointer.y) * 0.012) * interactionProfile.strength
}

const setTouchDrag = (clientX, clientY) =>
{
    currentPointerType = 'touch'

    const deltaX = (clientX - touchDrag.lastX) / sizes.width
    const deltaY = (clientY - touchDrag.lastY) / sizes.height
    const dragX = THREE.MathUtils.clamp((clientX - touchDrag.startX) / sizes.width * 1.25, -0.4, 0.4)
    const dragY = THREE.MathUtils.clamp((clientY - touchDrag.startY) / sizes.height * 1.1, -0.32, 0.32)

    touchDrag.lastX = clientX
    touchDrag.lastY = clientY
    touchDrag.velocityX = deltaX
    touchDrag.velocityY = deltaY

    pointer.x = dragX
    pointer.y = dragY

    target.rotationY = dragX * 0.38
    target.rotationX = dragY * 0.26
    target.positionX = dragX * 0.09
    target.positionY = - dragY * 0.08
    target.cameraX = dragX * 0.024
    target.cameraY = - dragY * 0.02
    target.scale = 1.01 + Math.min(Math.abs(dragX) + Math.abs(dragY), 0.6) * 0.025

    touchSpin.x = THREE.MathUtils.clamp(touchSpin.x + deltaY * 4.2, -0.16, 0.16)
    touchSpin.y = THREE.MathUtils.clamp(touchSpin.y + deltaX * 5.6, -0.24, 0.24)
    touchSpin.z = THREE.MathUtils.clamp(touchSpin.z - deltaX * 3.8, -0.2, 0.2)
}

window.addEventListener('pointerdown', (event) =>
{
    const clickedInteractiveElement = event.target instanceof Element && event.target.closest('a, button')

    if(clickedInteractiveElement)
    {
        return
    }

    if(event.pointerType === 'touch' || event.pointerType === 'pen')
    {
        touchDrag.active = true
        touchDrag.pointerId = event.pointerId
        touchDrag.startX = event.clientX
        touchDrag.startY = event.clientY
        touchDrag.lastX = event.clientX
        touchDrag.lastY = event.clientY
        setTouchDrag(event.clientX, event.clientY)
        canvas.setPointerCapture(event.pointerId)

        return
    }

    setPointer(event.clientX, event.clientY, event.pointerType)
})

window.addEventListener('pointermove', (event) =>
{
    if(touchDrag.active && event.pointerId === touchDrag.pointerId)
    {
        setTouchDrag(event.clientX, event.clientY)
        return
    }

    setPointer(event.clientX, event.clientY, event.pointerType)
})

window.addEventListener('pointerup', (event) =>
{
    if(event.pointerType === 'touch' || event.pointerType === 'pen')
    {
        if(touchDrag.active && event.pointerId === touchDrag.pointerId && canvas.hasPointerCapture(event.pointerId))
        {
            canvas.releasePointerCapture(event.pointerId)
        }

        touchSpin.x = THREE.MathUtils.clamp(touchSpin.x + touchDrag.velocityY * 8.5, -0.24, 0.24)
        touchSpin.y = THREE.MathUtils.clamp(touchSpin.y + touchDrag.velocityX * 11.5, -0.34, 0.34)
        touchSpin.z = THREE.MathUtils.clamp(touchSpin.z - touchDrag.velocityX * 8.5, -0.28, 0.28)
        touchDrag.active = false
        touchDrag.pointerId = null
        resetInteraction()
    }
})

window.addEventListener('pointercancel', () =>
{
    touchDrag.active = false
    touchDrag.pointerId = null
    resetInteraction()
})

window.addEventListener('pointerleave', () =>
{
    touchDrag.active = false
    touchDrag.pointerId = null
    resetInteraction()
})

const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime
    const layout = getLayoutConfig()
    const interactionProfile = getInteractionProfile()

    mesh.rotation.x += ((0.72 + target.rotationX) - mesh.rotation.x) * interactionProfile.rotationEase
    mesh.rotation.y += ((elapsedTime * 0.24 + target.rotationY) - mesh.rotation.y) * interactionProfile.rotationEase
    mesh.rotation.z += 0.0015
    mesh.rotation.x += touchSpin.x
    mesh.rotation.y += touchSpin.y
    mesh.rotation.z += touchSpin.z

    touchSpin.x *= 0.94
    touchSpin.y *= 0.945
    touchSpin.z *= 0.94

    const baseX = layout.shapeX
    const baseY = layout.shapeY

    shapeGroup.position.x += ((baseX + target.positionX) - shapeGroup.position.x) * interactionProfile.positionEase
    shapeGroup.position.y += ((baseY + target.positionY + Math.sin(elapsedTime * 1.1) * layout.floatAmount) - shapeGroup.position.y) * interactionProfile.positionEase

    cameraGroup.position.x += (target.cameraX - cameraGroup.position.x) * interactionProfile.cameraEase
    cameraGroup.position.y += (target.cameraY - cameraGroup.position.y) * interactionProfile.cameraEase

    mesh.scale.x += (target.scale - mesh.scale.x) * interactionProfile.scaleEase
    mesh.scale.y += (target.scale - mesh.scale.y) * interactionProfile.scaleEase
    mesh.scale.z += (target.scale - mesh.scale.z) * interactionProfile.scaleEase

    for(let i = 0; i < particlesCount; i++)
    {
        const xIndex = i * 3
        const yIndex = xIndex + 1

        particlePositions[yIndex] -= particleSpeeds[i] * deltaTime
        particlePositions[xIndex] += Math.sin(elapsedTime * 0.7 + particleDrift[i]) * 0.0008

        if(particlePositions[yIndex] < -5.8)
        {
            particlePositions[yIndex] = 5.8
            particlePositions[xIndex] = (Math.random() - 0.5) * 12
        }
    }

    particlesGeometry.attributes.position.needsUpdate = true
    particles.rotation.y = elapsedTime * 0.02

    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()
