import * as THREE from 'three'
import gsap from 'gsap'

const parameters = {
    materialColor: '#a600ff'
}

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')
const sections = Array.from(document.querySelectorAll('.section'))

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */
// Texture
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

// Material
const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradientTexture
})

// Objects
const objectsDistance = 4
const mesh1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    material
)
const mesh2 = new THREE.Mesh(
    new THREE.ConeGeometry(1, 2, 32),
    material
)
const mesh3 = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
    material
)

mesh1.position.x = 2
mesh2.position.x = - 2
mesh3.position.x = 2

scene.add(mesh1, mesh2, mesh3)

const sectionMeshes = [ mesh1, mesh2, mesh3 ]

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)

/**
 * Particles
 */
// Geometry
const particlesCount = 200
const positions = new Float32Array(particlesCount * 3)

for(let i = 0; i < particlesCount; i++)
{
    positions[i * 3 + 0] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

// Material
const particlesMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: 0.03
})

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Camera
 */
// Group
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

const getSectionHeight = () =>
{
    return sections[0]?.getBoundingClientRect().height || sizes.height
}

const updateLayout = () =>
{
    const isMobile = sizes.width <= 768
    const horizontalOffset = isMobile ? 0.95 : 2
    const verticalOffset = isMobile ? - 0.95 : 0

    mesh1.position.x = horizontalOffset
    mesh2.position.x = - horizontalOffset
    mesh3.position.x = horizontalOffset

    mesh1.position.y = - objectsDistance * 0 + verticalOffset
    mesh2.position.y = - objectsDistance * 1 + verticalOffset
    mesh3.position.y = - objectsDistance * 2 + verticalOffset

    camera.position.z = isMobile ? 8.8 : 6
}

updateLayout()

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    updateLayout()

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Scroll
 */
let scrollY = window.scrollY
let currentSection = 0

window.addEventListener('scroll', () =>
{
    scrollY = window.scrollY
    const newSection = Math.round(scrollY / getSectionHeight())

    if(newSection != currentSection)
    {
        currentSection = newSection

        gsap.to(
            sectionMeshes[currentSection].rotation,
            {
                duration: 1.5,
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3',
                z: '+=1.5'
            }
        )
    }
})

/**
 * Cursor
 */
const cursor = {}
cursor.x = 0
cursor.y = 0

const touch = {
    active: false,
    x: 0,
    y: 0,
    rotationX: 0,
    rotationY: 0
}

const getActiveMesh = () =>
{
    return sectionMeshes[Math.min(currentSection, sectionMeshes.length - 1)]
}

window.addEventListener('mousemove', (event) =>
{
    cursor.x = event.clientX / sizes.width - 0.5
    cursor.y = event.clientY / sizes.height - 0.5
})

window.addEventListener('touchstart', (event) =>
{
    const firstTouch = event.touches[0]

    if(! firstTouch)
    {
        return
    }

    touch.active = true
    touch.x = firstTouch.clientX
    touch.y = firstTouch.clientY
    cursor.x = firstTouch.clientX / sizes.width - 0.5
    cursor.y = firstTouch.clientY / sizes.height - 0.5
}, { passive: true })

window.addEventListener('touchmove', (event) =>
{
    const firstTouch = event.touches[0]

    if(! touch.active || ! firstTouch)
    {
        return
    }

    const deltaX = (firstTouch.clientX - touch.x) / sizes.width
    const deltaY = (firstTouch.clientY - touch.y) / sizes.height

    touch.x = firstTouch.clientX
    touch.y = firstTouch.clientY
    touch.rotationY += deltaX * 14
    touch.rotationX += deltaY * 14
    cursor.x = firstTouch.clientX / sizes.width - 0.5
    cursor.y = firstTouch.clientY / sizes.height - 0.5
}, { passive: true })

const releaseTouch = () =>
{
    touch.active = false
}

window.addEventListener('touchend', releaseTouch, { passive: true })
window.addEventListener('touchcancel', releaseTouch, { passive: true })

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // Animate camera
    camera.position.y = - scrollY / getSectionHeight() * objectsDistance

    const parallaxX = cursor.x * 0.5
    const parallaxY = - cursor.y * 0.5
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime

    const activeMesh = getActiveMesh()
    activeMesh.rotation.x += touch.rotationX * deltaTime * 8
    activeMesh.rotation.y += touch.rotationY * deltaTime * 8
    touch.rotationX *= 0.92
    touch.rotationY *= 0.92

    // Animate meshes
    for(const mesh of sectionMeshes)
    {
        mesh.rotation.x += deltaTime * 0.1
        mesh.rotation.y += deltaTime * 0.12
    }

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
