import * as THREE from 'three'
import diplomaImage from '../certificates/diploma.jpg'

const canvas = document.querySelector('canvas.webgl')
const sections = [...document.querySelectorAll('.panel-section')]
const pageLinks = [...document.querySelectorAll('.page-link')]
const scrollLinks = [...document.querySelectorAll('[data-scroll-link]')]

const certificateTitle = document.querySelector('[data-cert-title]')
const certificateIssuer = document.querySelector('[data-cert-issuer]')
const certificateDescription = document.querySelector('[data-cert-description]')
const certificateTags = document.querySelector('[data-cert-tags]')
const certificateCounter = document.querySelector('[data-cert-counter]')
const certificateStatus = document.querySelector('.certificate-status')
const certificateImage = document.querySelector('[data-cert-image]')
const mobileDegreeImage = document.querySelector('[data-mobile-degree-image]')
const certificatePrev = document.querySelector('[data-cert-prev]')
const certificateNext = document.querySelector('[data-cert-next]')
const museumImageMain = document.querySelector('[data-museum-image-main]')
const museumImageLake = document.querySelector('[data-museum-image-lake]')
const museumImageQuiz = document.querySelector('[data-museum-image-quiz]')
const museumVideoPosterLake = document.querySelector('[data-museum-video-poster-lake]')
const museumVideoPosterQuiz = document.querySelector('[data-museum-video-poster-quiz]')
const museumTitleLakeImage = document.querySelector('[data-museum-title-lake-image]')
const museumTitleQuizImage = document.querySelector('[data-museum-title-quiz-image]')
const museumTitleLakeVideo = document.querySelector('[data-museum-title-lake-video]')
const museumTitleQuizVideo = document.querySelector('[data-museum-title-quiz-video]')
const museumImageTriggers = [...document.querySelectorAll('[data-museum-lightbox-trigger]')]
const museumVideoTriggers = [...document.querySelectorAll('[data-museum-video-lightbox-trigger]')]
const museumLightbox = document.querySelector('[data-museum-lightbox]')
const museumLightboxImage = document.querySelector('[data-museum-lightbox-image]')
const museumLightboxVideo = document.querySelector('[data-museum-lightbox-video]')
const museumLightboxCloseButtons = [...document.querySelectorAll('[data-museum-lightbox-close]')]

const certificates = [
    {
        label: 'Certification 01',
        title: 'Frontend Development Specialization',
        issuer: 'Coursera / Meta • 2024',
        description: 'Use this first slide for one of your main frontend certifications and explain clearly what it validates.',
        tags: ['React', 'Responsive UI', 'Components']
    },
    {
        label: 'Certification 02',
        title: 'JavaScript Algorithms & Data Structures',
        issuer: 'freeCodeCamp • 2024',
        description: 'A great place for a core JavaScript certification focused on logic, structure, and problem solving.',
        tags: ['JavaScript', 'ES6+', 'Problem Solving']
    },
    {
        label: 'Certification 03',
        title: 'Advanced CSS and Visual Systems',
        issuer: 'Udemy • 2024',
        description: 'Use this card for styling, layout systems, animation, or interface polish certifications.',
        tags: ['CSS', 'Animation', 'Design Systems']
    },
    {
        label: 'Certification 04',
        title: 'Three.js Interactive Experiences',
        issuer: 'Three.js Journey • 2024',
        description: 'Ideal for 3D web work, shaders, interaction design, and real-time portfolio experiments.',
        tags: ['Three.js', 'WebGL', 'Interaction']
    },
    {
        label: 'Certification 05',
        title: 'UI / UX Design Foundations',
        issuer: 'Google • 2023',
        description: 'A nice slot for design research, wireframes, prototyping, or user-centered design work.',
        tags: ['UX', 'Prototyping', 'Research']
    },
    {
        label: 'Certification 06',
        title: 'Version Control and Collaboration',
        issuer: 'GitHub Learning • 2023',
        description: 'Good for Git, branching, collaboration, and real project workflow experience.',
        tags: ['Git', 'Collaboration', 'Workflow']
    },
    {
        label: 'Certification 07',
        title: 'Web Performance Optimization',
        issuer: 'Frontend Masters • 2024',
        description: 'Use this for performance, optimization, lighthouse, and clean delivery on production websites.',
        tags: ['Performance', 'Optimization', 'Core Web Vitals']
    },
    {
        label: 'Certification 08',
        title: 'Motion Design for Interfaces',
        issuer: 'DesignCourse • 2024',
        description: 'Perfect for animation, transitions, micro-interactions, and a more premium UI feel.',
        tags: ['Motion', 'Transitions', 'UI Polish']
    },
    {
        label: 'Certification 09',
        title: 'Creative Coding Essentials',
        issuer: 'OpenProcessing / Workshop • 2023',
        description: 'A strong slot for creative coding, experimentation, and visually expressive web projects.',
        tags: ['Creative Coding', 'Visuals', 'Generative']
    },
    {
        label: 'Certification 10',
        title: 'Professional English / Communication',
        issuer: 'Language Institute • 2023',
        description: 'If useful, this last one can become an English certificate, soft-skill credential, or presentation training.',
        tags: ['Communication', 'Presentation', 'Professional']
    }
]

let currentCertificateIndex = 0
let activeMuseumTrigger = null

if(mobileDegreeImage)
{
    mobileDegreeImage.src = diplomaImage
    mobileDegreeImage.alt = 'Degree diploma preview'
}

const museumImageModules = import.meta.glob('../museum/*.{jpg,jpeg,png,webp}', {
    eager: true,
    import: 'default'
})

const museumVideoModules = import.meta.glob('../museum/*.{mp4,webm,ogg}', {
    eager: true,
    import: 'default'
})

const museumAssetCollator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base'
})

const normalizeMuseumAsset = ([path, url]) =>
{
    const normalizedPath = path.replace(/\\/g, '/')
    const fileName = normalizedPath.split('/').pop() ?? 'asset'
    const cleanedName = fileName
        .replace(/\.[^.]+$/, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()

    return {
        url,
        fileName,
        normalizedName: cleanedName.toLowerCase(),
        title: cleanedName.replace(/\b\w/g, (character) => character.toUpperCase())
    }
}

const museumImages = Object.entries(museumImageModules)
    .sort(([pathA], [pathB]) => museumAssetCollator.compare(pathA, pathB))
    .map(normalizeMuseumAsset)

const museumVideos = Object.entries(museumVideoModules)
    .sort(([pathA], [pathB]) => museumAssetCollator.compare(pathA, pathB))
    .map(normalizeMuseumAsset)

const findMuseumAsset = (assets, keywords) =>
    assets.find((asset) => keywords.every((keyword) => asset.normalizedName.includes(keyword)))

const renderMuseumMedia = () =>
{
    const museumMainImage = findMuseumAsset(museumImages, ['486043026'])
    const lakeImage = findMuseumAsset(museumImages, ['lake'])
    const quizImage = findMuseumAsset(museumImages, ['quiz'])
    const lakeVideoPoster = findMuseumAsset(museumImages, ['screenshot', '3'])
    const quizVideoPoster = findMuseumAsset(museumImages, ['screenshot', '2'])
    const lakeVideo = findMuseumAsset(museumVideos, ['lake'])
    const quizVideo = findMuseumAsset(museumVideos, ['quiz'])

    if(museumImageMain && museumMainImage)
    {
        museumImageMain.src = museumMainImage.url
        museumImageMain.alt = 'Museum exhibit preview'
    }

    if(museumImageLake && lakeImage)
    {
        museumImageLake.src = lakeImage.url
        museumImageLake.alt = lakeImage.title
    }

    if(museumTitleLakeImage)
    {
        museumTitleLakeImage.textContent = 'Lake Photo'
    }

    if(museumImageQuiz && quizImage)
    {
        museumImageQuiz.src = quizImage.url
        museumImageQuiz.alt = quizImage.title
    }

    if(museumTitleQuizImage)
    {
        museumTitleQuizImage.textContent = 'Quiz Photo'
    }

    if(museumVideoPosterLake && lakeVideoPoster)
    {
        museumVideoPosterLake.src = lakeVideoPoster.url
        museumVideoPosterLake.alt = 'Lake video preview'
    }

    if(museumTitleLakeVideo)
    {
        museumTitleLakeVideo.textContent = 'Lake Video'
    }

    if(museumVideoPosterQuiz && quizVideoPoster)
    {
        museumVideoPosterQuiz.src = quizVideoPoster.url
        museumVideoPosterQuiz.alt = 'Quiz video preview'
    }

    if(museumTitleQuizVideo)
    {
        museumTitleQuizVideo.textContent = 'Quiz Video'
    }

    museumVideoTriggers.forEach((trigger) =>
    {
        const type = trigger.getAttribute('data-museum-video-lightbox-trigger')
        const selectedVideo = type === 'lake' ? lakeVideo : quizVideo
        const selectedPoster = type === 'lake' ? lakeVideoPoster : quizVideoPoster

        if(selectedVideo)
        {
            trigger.dataset.videoSrc = selectedVideo.url
            trigger.dataset.videoTitle = selectedVideo.title
        }

        if(selectedPoster)
        {
            trigger.dataset.videoPoster = selectedPoster.url
        }
    })
}

const closeMuseumLightbox = () =>
{
    if(!museumLightbox)
    {
        return
    }

    museumLightbox.hidden = true
    museumLightbox.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('museum-lightbox-open')

    if(museumLightboxImage)
    {
        museumLightboxImage.removeAttribute('src')
        museumLightboxImage.alt = ''
        museumLightboxImage.hidden = true
    }

    if(museumLightboxVideo)
    {
        museumLightboxVideo.pause()
        museumLightboxVideo.hidden = true
        museumLightboxVideo.removeAttribute('src')
        museumLightboxVideo.removeAttribute('poster')
        museumLightboxVideo.load()
    }

    activeMuseumTrigger?.focus()
    activeMuseumTrigger = null
}

const openMuseumImageLightbox = (trigger) =>
{
    const sourceImage = trigger.querySelector('.museum-image')

    if(!museumLightbox || !museumLightboxImage || !sourceImage?.getAttribute('src'))
    {
        return
    }

    activeMuseumTrigger = trigger
    museumLightboxImage.src = sourceImage.currentSrc || sourceImage.src
    museumLightboxImage.alt = sourceImage.alt
    museumLightboxImage.hidden = false
    museumLightboxVideo?.setAttribute('hidden', '')
    museumLightbox.hidden = false
    museumLightbox.setAttribute('aria-hidden', 'false')
    document.body.classList.add('museum-lightbox-open')
    museumLightboxCloseButtons[0]?.focus()
}

const openMuseumVideoLightbox = (trigger) =>
{
    const videoSrc = trigger.dataset.videoSrc
    const videoPoster = trigger.dataset.videoPoster
    const videoTitle = trigger.dataset.videoTitle ?? 'Museum video preview'

    if(!museumLightbox || !museumLightboxVideo || !videoSrc)
    {
        return
    }

    activeMuseumTrigger = trigger

    if(museumLightboxImage)
    {
        museumLightboxImage.hidden = true
        museumLightboxImage.removeAttribute('src')
        museumLightboxImage.alt = ''
    }

    museumLightboxVideo.hidden = false
    museumLightboxVideo.src = videoSrc

    if(videoPoster)
    {
        museumLightboxVideo.poster = videoPoster
    }

    museumLightboxVideo.setAttribute('aria-label', videoTitle)
    museumLightbox.hidden = false
    museumLightbox.setAttribute('aria-hidden', 'false')
    document.body.classList.add('museum-lightbox-open')
    museumLightboxCloseButtons[0]?.focus()
    museumLightboxVideo.load()
    museumLightboxVideo.play().catch(() => {})
}

const certificateImageModules = import.meta.glob(
    [
        '../certificates/*.jpg',
        '../certificates/*.jpeg',
        '../certificates/*.png',
        '../certificates/*.webp'
    ],
    {
        eager: true,
        import: 'default'
    }
)

const certificateNameCollator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base'
})

const certificateMetadataByFileName = {
    'Page_36_page-0001.jpg': {
        title: 'Technology as a Driving Tool for Enhanced Cultural Experiences',
        issuer: 'International Scientific Conference • 2023',
        description: 'Certificate of attendance for the SMART TOUR conference at the University of Ioannina.',
        tags: ['Conference', 'Cultural Tech', 'Attendance']
    },
    'Three.js Journey - Certificate_page-0001.jpg': {
        title: 'Three.js Journey',
        issuer: 'Bruno Simon • 2026',
        description: 'Certificate of completion for the Three.js Journey course.',
        tags: ['Three.js', 'WebGL', 'Certificate']
    },
    'UC-159ba81b-7c28-4e2c-8f0c-ee8aca89e51d_page-0001.jpg': {
        title: 'Unreal Engine 5 - Create Realistic Environment',
        issuer: '3D College • 2026',
        description: 'Udemy certificate of completion.',
        tags: ['Unreal Engine 5', 'Environment', 'Udemy']
    },
    'UC-5279bfce-9b74-4f2e-9ec8-332a6bc18340_page-0001.jpg': {
        title: 'Unreal Engine 5 Survival Framework - Multiplayer',
        issuer: 'Eric Ruts • 2026',
        description: 'Udemy certificate of completion.',
        tags: ['Unreal Engine 5', 'Multiplayer', 'Udemy']
    },
    'UC-527cb5ee-b114-4f1c-96aa-0fbd622665b7_page-0001.jpg': {
        title: 'Unreal Engine 5 - Gameplay Ability System - Top Down',
        issuer: 'Stephen Ulibarri • 2026',
        description: 'Udemy certificate of completion.',
        tags: ['Unreal Engine 5', 'Gameplay Ability System', 'Udemy']
    },
    'UC-62b399f5-7bba-4091-ae45-c4e88edf1776_page-0001.jpg': {
        title: 'How to Make a 2D Clicker Game - Unreal Engine 5',
        issuer: 'Pixel Helmet • 2026',
        description: 'Udemy certificate of completion.',
        tags: ['Unreal Engine 5', '2D Clicker Game', 'Udemy']
    },
    'UC-7e4c65f3-2127-4cb4-88c5-a7a6b19ceaac_page-0001.jpg': {
        title: 'Unreal Engine 5 - Create Professional Cinematics & Trailers',
        issuer: '3D College • 2026',
        description: 'Udemy certificate of completion.',
        tags: ['Unreal Engine 5', 'Cinematics', 'Udemy']
    },
    'UC-bfd91d32-dddc-4728-a2c0-7b6f3733fea8_page-0001.jpg': {
        title: 'The Ultimate Unreal Engine 2d Game DevelopmentCourse',
        issuer: 'Cobra Code • 2026',
        description: 'Udemy certificate of completion.',
        tags: ['Unreal Engine', 'Game Dev', 'Udemy']
    },
    'UC-cd2644b9-10c4-4111-be9c-6bbe5460b9e2_page-0001.jpg': {
        title: 'Unreal Engine 5 C++: The Ultimate Game Developer Course',
        issuer: 'Stephen Ulibarri • 2026',
        description: 'Udemy certificate of completion.',
        tags: ['Unreal Engine 5', 'C++', 'Udemy']
    },
    'UC-e0f4f9ae-53d2-4cb7-8e90-b03261eee98a_page-0001.jpg': {
        title: 'Unreal Engine 5: Create a Top-Down 2D Survivors Style Game',
        issuer: 'Howl Chang • 2026',
        description: 'Udemy certificate of completion.',
        tags: ['Unreal Engine 5', 'Top-Down 2D', 'Udemy']
    },
    'Grow Greek Tourism_page-0001.jpg': {
        title: 'Build your Personal Brand',
        issuer: 'Google Grow Greek Tourism Online • 2019',
        description: 'Certificate from the Grow Greek Tourism Online seminar.',
        tags: ['Google', 'Tourism', 'Branding']
    }
}

const certificateSlides = (() =>
{
    const entries = Object.entries(certificateImageModules)
        .filter(([path]) =>
        {
            const normalizedPath = path.replace(/\\/g, '/')
            return !/\/diploma\.(jpg|jpeg|png|webp)$/i.test(normalizedPath)
        })
        .sort(([pathA], [pathB]) => certificateNameCollator.compare(pathA, pathB))

    const page36EntryIndex = entries.findIndex(([path]) => /\/Page_36_page-0001\.(jpg|jpeg|png|webp)$/i.test(path.replace(/\\/g, '/')))
    const tourismEntryIndex = entries.findIndex(([path]) => /\/Grow Greek Tourism_page-0001\.(jpg|jpeg|png|webp)$/i.test(path.replace(/\\/g, '/')))

    const reorderedEntries = [...entries]

    if(tourismEntryIndex !== -1)
    {
        const [tourismEntry] = reorderedEntries.splice(tourismEntryIndex, 1)
        reorderedEntries.push(tourismEntry)
    }

    if(page36EntryIndex !== -1)
    {
        const currentPage36Index = reorderedEntries.findIndex(([path]) => /\/Page_36_page-0001\.(jpg|jpeg|png|webp)$/i.test(path.replace(/\\/g, '/')))

        if(currentPage36Index !== -1)
        {
            const [page36Entry] = reorderedEntries.splice(currentPage36Index, 1)
            const insertIndex = Math.min(1, reorderedEntries.length)
            reorderedEntries.splice(insertIndex, 0, page36Entry)
        }
    }

    if(reorderedEntries.length === 0)
    {
        return [
            {
                label: 'Certificate 01',
                title: 'Certificate Image',
                issuer: 'Certificate archive image',
                description: 'Add certificate images in the certificates folder to fill this slider.',
                tags: ['Certificate', 'Image', 'Archive'],
                image: diplomaImage,
                alt: 'Certificate image placeholder'
            }
        ]
    }

    return reorderedEntries.map(([path, image], index) =>
    {
        const normalizedPath = path.replace(/\\/g, '/')
        const fileName = normalizedPath.split('/').pop() ?? `certificate-${index + 1}.jpg`
        const extension = fileName.split('.').pop()?.toUpperCase() ?? 'IMG'
        const cleanedName = fileName
            .replace(/\.[^.]+$/, '')
            .replace(/_page-\d+$/i, '')
            .trim()
        const isGenericCourseCertificate = /^UC-/i.test(cleanedName)
        const readableName = isGenericCourseCertificate
            ? `Course Certificate ${String(index + 1).padStart(2, '0')}`
            : cleanedName.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
        const metadata = certificateMetadataByFileName[fileName]

        return {
            label: `Certificate ${String(index + 1).padStart(2, '0')}`,
            title: metadata?.title ?? readableName,
            issuer: metadata?.issuer ?? (isGenericCourseCertificate ? 'Certificate image from your archive' : 'Named certificate image'),
            description: metadata?.description ?? 'Real certificate preview loaded from the certificates folder as an image.',
            tags: metadata?.tags ?? ['Certificate', extension, 'Image'],
            image,
            alt: metadata?.title ?? readableName
        }
    })
})()

const renderCertificate = () =>
{
    const certificate = certificateSlides[currentCertificateIndex]

    if(!certificateTitle || !certificateIssuer || !certificateDescription || !certificateTags || !certificateCounter || !certificateStatus || !certificateImage)
    {
        return
    }

    certificateStatus.textContent = certificate.label
    certificateTitle.textContent = certificate.title
    certificateIssuer.textContent = certificate.issuer
    certificateDescription.textContent = certificate.description
    certificateCounter.textContent = `${String(currentCertificateIndex + 1).padStart(2, '0')} / ${String(certificateSlides.length).padStart(2, '0')}`
    certificateImage.src = certificate.image
    certificateImage.alt = certificate.alt
    certificateTags.replaceChildren(
        ...certificate.tags.map((tag) =>
        {
            const element = document.createElement('span')
            element.textContent = tag
            return element
        })
    )
}

certificatePrev?.addEventListener('click', () =>
{
    currentCertificateIndex = (currentCertificateIndex - 1 + certificateSlides.length) % certificateSlides.length
    renderCertificate()
})

certificateNext?.addEventListener('click', () =>
{
    currentCertificateIndex = (currentCertificateIndex + 1) % certificateSlides.length
    renderCertificate()
})

if(certificatePrev)
{
    certificatePrev.disabled = certificateSlides.length <= 1
}

if(certificateNext)
{
    certificateNext.disabled = certificateSlides.length <= 1
}

museumImageTriggers.forEach((trigger) =>
{
    trigger.addEventListener('click', () =>
    {
        openMuseumImageLightbox(trigger)
    })
})

museumVideoTriggers.forEach((trigger) =>
{
    trigger.addEventListener('click', () =>
    {
        openMuseumVideoLightbox(trigger)
    })
})

museumLightboxCloseButtons.forEach((button) =>
{
    button.addEventListener('click', closeMuseumLightbox)
})

window.addEventListener('keydown', (event) =>
{
    if(event.key === 'Escape' && museumLightbox && !museumLightbox.hidden)
    {
        closeMuseumLightbox()
    }
})

renderCertificate()
renderMuseumMedia()

const scene = new THREE.Scene()
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 6)
cameraGroup.add(camera)

const torusGroup = new THREE.Group()
const degreeGroup = new THREE.Group()

scene.add(torusGroup)
scene.add(degreeGroup)

const torusGeometry = new THREE.TorusGeometry(1.35, 0.44, 40, 160)

const torusMaterial = new THREE.MeshPhysicalMaterial({
    color: '#a600ff',
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
    emissiveIntensity: 0.12,
    transparent: true,
    opacity: 1
})

const torusInnerMaterial = new THREE.MeshPhysicalMaterial({
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

const torusGlowMaterial = new THREE.MeshBasicMaterial({
    color: '#bb59ff',
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
})

const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial)
const torusInnerMesh = new THREE.Mesh(torusGeometry, torusInnerMaterial)
const torusGlowMesh = new THREE.Mesh(torusGeometry, torusGlowMaterial)

torusInnerMesh.scale.setScalar(0.985)
torusGlowMesh.scale.setScalar(1.06)
torusMesh.add(torusInnerMesh, torusGlowMesh)
torusGroup.add(torusMesh)

const createDegreePlaceholderTexture = () =>
{
    const textureCanvas = document.createElement('canvas')
    textureCanvas.width = 1400
    textureCanvas.height = 1980

    const context = textureCanvas.getContext('2d')

    context.fillStyle = '#f4efe5'
    context.fillRect(0, 0, textureCanvas.width, textureCanvas.height)

    const gradient = context.createLinearGradient(0, 0, textureCanvas.width, textureCanvas.height)
    gradient.addColorStop(0, '#fbf7ef')
    gradient.addColorStop(1, '#ebe1d0')
    context.fillStyle = gradient
    context.fillRect(0, 0, textureCanvas.width, textureCanvas.height)

    for(let i = 0; i < 6000; i++)
    {
        const alpha = Math.random() * 0.045
        const shade = 212 + Math.random() * 25

        context.fillStyle = `rgba(${shade}, ${shade - 5}, ${shade - 10}, ${alpha})`
        context.fillRect(
            Math.random() * textureCanvas.width,
            Math.random() * textureCanvas.height,
            2 + Math.random() * 2,
            2 + Math.random() * 2
        )
    }

    context.strokeStyle = 'rgba(116, 92, 66, 0.22)'
    context.lineWidth = 12
    context.strokeRect(70, 70, textureCanvas.width - 140, textureCanvas.height - 140)

    context.strokeStyle = 'rgba(116, 92, 66, 0.14)'
    context.lineWidth = 4
    context.strokeRect(108, 108, textureCanvas.width - 216, textureCanvas.height - 216)

    context.fillStyle = 'rgba(124, 89, 58, 0.12)'
    context.beginPath()
    context.arc(textureCanvas.width / 2, 320, 110, 0, Math.PI * 2)
    context.fill()

    context.strokeStyle = 'rgba(124, 89, 58, 0.12)'
    context.lineWidth = 8
    context.beginPath()
    context.arc(textureCanvas.width / 2, 320, 160, 0, Math.PI * 2)
    context.stroke()

    context.textAlign = 'center'
    context.fillStyle = '#7a5e45'
    context.font = '700 74px Georgia'
    context.fillText('Bachelor Diploma', textureCanvas.width / 2, 520)

    context.font = '400 30px Georgia'
    context.fillText('Replace this texture later with the real photo of your degree', textureCanvas.width / 2, 590)

    context.font = '700 48px Georgia'
    context.fillStyle = '#6f533e'
    context.fillText('Stefanos Kasapis', textureCanvas.width / 2, 820)

    context.font = '400 30px Georgia'
    context.fillStyle = '#856853'
    context.fillText('Department / University / Graduation Year', textureCanvas.width / 2, 894)

    context.strokeStyle = 'rgba(126, 95, 69, 0.3)'
    context.lineWidth = 3

    for(let i = 0; i < 6; i++)
    {
        const y = 1060 + i * 96
        context.beginPath()
        context.moveTo(180, y)
        context.lineTo(textureCanvas.width - 180, y)
        context.stroke()
    }

    context.fillStyle = '#6d513d'
    context.font = 'italic 28px Georgia'
    context.fillText('Official degree texture placeholder', textureCanvas.width / 2, 1600)

    context.textAlign = 'left'
    context.font = '600 32px Georgia'
    context.fillText('Registrar Signature', 180, 1790)
    context.textAlign = 'right'
    context.fillText('Institution Seal', textureCanvas.width - 180, 1790)

    const texture = new THREE.CanvasTexture(textureCanvas)
    texture.colorSpace = THREE.SRGBColorSpace

    return texture
}

const createDegreeBumpTexture = () =>
{
    const bumpCanvas = document.createElement('canvas')
    bumpCanvas.width = 1024
    bumpCanvas.height = 1450

    const context = bumpCanvas.getContext('2d')
    const gradient = context.createLinearGradient(0, 0, bumpCanvas.width, bumpCanvas.height)
    gradient.addColorStop(0, '#7c7c7c')
    gradient.addColorStop(1, '#969696')
    context.fillStyle = gradient
    context.fillRect(0, 0, bumpCanvas.width, bumpCanvas.height)

    for(let i = 0; i < 9000; i++)
    {
        const brightness = 120 + Math.random() * 30
        context.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${0.035 + Math.random() * 0.04})`
        context.fillRect(Math.random() * bumpCanvas.width, Math.random() * bumpCanvas.height, 2, 2)
    }

    context.strokeStyle = 'rgba(160, 160, 160, 0.28)'
    context.lineWidth = 18
    context.strokeRect(60, 60, bumpCanvas.width - 120, bumpCanvas.height - 120)

    return new THREE.CanvasTexture(bumpCanvas)
}

const createDegreeParchmentTexture = () =>
{
    const parchmentCanvas = document.createElement('canvas')
    parchmentCanvas.width = 1024
    parchmentCanvas.height = 1450

    const context = parchmentCanvas.getContext('2d')
    context.clearRect(0, 0, parchmentCanvas.width, parchmentCanvas.height)

    const centerGlow = context.createRadialGradient(
        parchmentCanvas.width * 0.48,
        parchmentCanvas.height * 0.46,
        parchmentCanvas.width * 0.08,
        parchmentCanvas.width * 0.48,
        parchmentCanvas.height * 0.46,
        parchmentCanvas.width * 0.72
    )
    centerGlow.addColorStop(0, 'rgba(255, 246, 222, 0.22)')
    centerGlow.addColorStop(0.68, 'rgba(255, 246, 222, 0.08)')
    centerGlow.addColorStop(1, 'rgba(255, 246, 222, 0)')
    context.fillStyle = centerGlow
    context.fillRect(0, 0, parchmentCanvas.width, parchmentCanvas.height)

    for(let i = 0; i < 34; i++)
    {
        const x = Math.random() * parchmentCanvas.width
        const y = Math.random() * parchmentCanvas.height
        const radius = 140 + Math.random() * 260
        const stain = context.createRadialGradient(x, y, 0, x, y, radius)
        stain.addColorStop(0, `rgba(${164 + Math.random() * 24}, ${124 + Math.random() * 18}, ${66 + Math.random() * 14}, ${0.025 + Math.random() * 0.05})`)
        stain.addColorStop(0.55, `rgba(${176 + Math.random() * 20}, ${138 + Math.random() * 18}, ${82 + Math.random() * 12}, ${0.014 + Math.random() * 0.03})`)
        stain.addColorStop(1, 'rgba(176, 138, 82, 0)')
        context.fillStyle = stain
        context.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    }

    for(let i = 0; i < 2600; i++)
    {
        const alpha = 0.01 + Math.random() * 0.03
        const tone = 172 + Math.random() * 34
        context.fillStyle = `rgba(${tone}, ${134 + Math.random() * 24}, ${78 + Math.random() * 20}, ${alpha})`
        context.fillRect(
            Math.random() * parchmentCanvas.width,
            Math.random() * parchmentCanvas.height,
            0.8 + Math.random() * 2.2,
            0.8 + Math.random() * 2.2
        )
    }

    for(let i = 0; i < 110; i++)
    {
        const fromEdge = Math.floor(Math.random() * 4)
        const x =
            fromEdge === 0 ? Math.random() * 120 :
            fromEdge === 1 ? parchmentCanvas.width - Math.random() * 120 :
            Math.random() * parchmentCanvas.width
        const y = Math.random() * parchmentCanvas.height
        const radius = 28 + Math.random() * 72
        const stain = context.createRadialGradient(x, y, 0, x, y, radius)
        stain.addColorStop(0, `rgba(136, 96, 50, ${0.045 + Math.random() * 0.065})`)
        stain.addColorStop(0.5, 'rgba(150, 108, 58, 0.02)')
        stain.addColorStop(1, 'rgba(150, 108, 58, 0)')
        context.fillStyle = stain
        context.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    }

    for(let i = 0; i < 16; i++)
    {
        const x = Math.random() * parchmentCanvas.width
        const y = Math.random() * parchmentCanvas.height
        const radius = 80 + Math.random() * 140
        const bloom = context.createRadialGradient(x, y, 0, x, y, radius)
        bloom.addColorStop(0, `rgba(255, 244, 219, ${0.016 + Math.random() * 0.024})`)
        bloom.addColorStop(1, 'rgba(255, 242, 214, 0)')
        context.fillStyle = bloom
        context.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    }

    const topEdge = context.createLinearGradient(0, 0, 0, 210)
    topEdge.addColorStop(0, 'rgba(152, 108, 56, 0.18)')
    topEdge.addColorStop(0.55, 'rgba(168, 126, 74, 0.06)')
    topEdge.addColorStop(1, 'rgba(168, 126, 74, 0)')
    context.fillStyle = topEdge
    context.fillRect(0, 0, parchmentCanvas.width, 210)

    const bottomEdge = context.createLinearGradient(0, parchmentCanvas.height, 0, parchmentCanvas.height - 220)
    bottomEdge.addColorStop(0, 'rgba(152, 108, 56, 0.2)')
    bottomEdge.addColorStop(0.58, 'rgba(168, 126, 74, 0.07)')
    bottomEdge.addColorStop(1, 'rgba(168, 126, 74, 0)')
    context.fillStyle = bottomEdge
    context.fillRect(0, parchmentCanvas.height - 220, parchmentCanvas.width, 220)

    const leftEdge = context.createLinearGradient(0, 0, 150, 0)
    leftEdge.addColorStop(0, 'rgba(146, 104, 54, 0.18)')
    leftEdge.addColorStop(0.62, 'rgba(160, 118, 68, 0.06)')
    leftEdge.addColorStop(1, 'rgba(160, 118, 68, 0)')
    context.fillStyle = leftEdge
    context.fillRect(0, 0, 150, parchmentCanvas.height)

    const rightEdge = context.createLinearGradient(parchmentCanvas.width, 0, parchmentCanvas.width - 150, 0)
    rightEdge.addColorStop(0, 'rgba(146, 104, 54, 0.2)')
    rightEdge.addColorStop(0.62, 'rgba(160, 118, 68, 0.07)')
    rightEdge.addColorStop(1, 'rgba(160, 118, 68, 0)')
    context.fillStyle = rightEdge
    context.fillRect(parchmentCanvas.width - 150, 0, 150, parchmentCanvas.height)

    const texture = new THREE.CanvasTexture(parchmentCanvas)
    texture.colorSpace = THREE.SRGBColorSpace

    return texture
}

const createBentPlaneGeometry = (width, height, segmentsX, segmentsY) =>
{
    const geometry = new THREE.PlaneGeometry(width, height, segmentsX, segmentsY)
    const position = geometry.attributes.position

    for(let i = 0; i < position.count; i++)
    {
        const x = position.getX(i) / width
        const y = position.getY(i) / height
        const bend = Math.sin((x + 0.5) * Math.PI) * 0.016 + Math.cos((y + 0.5) * Math.PI * 1.2) * 0.006
        position.setZ(i, bend)
    }

    geometry.computeVertexNormals()

    return geometry
}

const textureLoader = new THREE.TextureLoader()
const degreeTexture = textureLoader.load(
    diplomaImage,
    (texture) =>
    {
        texture.colorSpace = THREE.SRGBColorSpace
        texture.needsUpdate = true
    },
    undefined,
    () =>
    {
        degreeFrontMaterial.map = createDegreePlaceholderTexture()
        degreeFrontMaterial.needsUpdate = true
    }
)
degreeTexture.colorSpace = THREE.SRGBColorSpace
degreeTexture.center.set(0.5, 0.5)
const degreeBumpTexture = createDegreeBumpTexture()
const degreeParchmentTexture = createDegreeParchmentTexture()
const degreeAspectRatio = 1472 / 2049
const degreeHeight = 2.76
const degreeWidth = degreeHeight * degreeAspectRatio
const degreeGeometry = createBentPlaneGeometry(degreeWidth, degreeHeight, 34, 42)

const degreeFrontMaterial = new THREE.MeshStandardMaterial({
    map: degreeTexture,
    color: '#f3deb1',
    bumpMap: degreeBumpTexture,
    bumpScale: 0.006,
    roughness: 0.96,
    metalness: 0,
    transparent: true,
    opacity: 0
})

const degreeParchmentMaterial = new THREE.MeshBasicMaterial({
    map: degreeParchmentTexture,
    transparent: true,
    opacity: 0,
    depthWrite: false
})

const degreeBackMaterial = new THREE.MeshPhysicalMaterial({
    color: '#f5ede0',
    roughness: 0.94,
    metalness: 0,
    transparent: true,
    opacity: 0
})

const degreeShadowMaterial = new THREE.MeshBasicMaterial({
    color: '#180d24',
    transparent: true,
    opacity: 0
})

const degreeBorderMaterial = new THREE.MeshPhysicalMaterial({
    color: '#d6b983',
    roughness: 0.96,
    metalness: 0,
    transparent: true,
    opacity: 0
})

const degreeFront = new THREE.Mesh(degreeGeometry, degreeFrontMaterial)
const degreeParchment = new THREE.Mesh(degreeGeometry.clone(), degreeParchmentMaterial)
const degreeBack = new THREE.Mesh(degreeGeometry.clone(), degreeBackMaterial)
const degreeBorder = new THREE.Mesh(degreeGeometry.clone(), degreeBorderMaterial)
const degreeShadow = new THREE.Mesh(degreeGeometry.clone(), degreeShadowMaterial)

degreeParchment.position.z = 0.015
degreeBack.position.z = -0.012
degreeBorder.position.z = -0.02
degreeShadow.position.set(0.06, -0.08, -0.12)
degreeShadow.scale.set(1.012, 1.012, 1)

degreeGroup.add(degreeShadow, degreeBorder, degreeBack, degreeFront, degreeParchment)

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

const documentLight = new THREE.PointLight('#fff6dd', 3.8, 12)
documentLight.position.set(-3.5, 1.2, 4.3)
scene.add(documentLight)

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

const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.12
degreeTexture.anisotropy = renderer.capabilities.getMaxAnisotropy()
degreeParchmentTexture.anisotropy = renderer.capabilities.getMaxAnisotropy()

const desktopLayouts = {
    home: {
        cameraZ: 6,
        torusX: 2.18,
        torusY: 0.18,
        torusScale: 0.9,
        torusOpacity: 1,
        torusRotationOffset: 0,
        torusFloat: 0.07,
        degreeX: -5.9,
        degreeY: 0.2,
        degreeScale: 0.72,
        degreeOpacity: 0,
        degreeRotationX: -0.08,
        degreeRotationY: 0.22,
        degreeRotationZ: -0.08,
        degreeFloat: 0.02,
        sceneParallax: 1
    },
    credentials: {
        cameraZ: 6.15,
        torusX: 4.6,
        torusY: 0.44,
        torusScale: 0.68,
        torusOpacity: 0,
        torusRotationOffset: 0.55,
        torusFloat: 0.03,
        degreeX: -2.55,
        degreeY: -0.04,
        degreeScale: 1.14,
        degreeOpacity: 1,
        degreeRotationX: -0.1,
        degreeRotationY: 0.26,
        degreeRotationZ: -0.12,
        degreeFloat: 0.018,
        sceneParallax: 0.65
    },
    museum: {
        cameraZ: 5.9,
        torusX: 4.9,
        torusY: 0.8,
        torusScale: 0.55,
        torusOpacity: 0,
        torusRotationOffset: 1.2,
        torusFloat: 0,
        degreeX: -4.7,
        degreeY: 0.3,
        degreeScale: 0.82,
        degreeOpacity: 0,
        degreeRotationX: -0.14,
        degreeRotationY: 0.34,
        degreeRotationZ: -0.18,
        degreeFloat: 0,
        sceneParallax: 0.15
    }
}

const mobileLayout = {
    cameraZ: 8.35,
    torusX: 0,
    torusY: 1,
    torusScale: 0.74,
    torusOpacity: 1,
    torusRotationOffset: 0,
    torusFloat: 0.04,
    degreeX: 0,
    degreeY: -3.2,
    degreeScale: 0.72,
    degreeOpacity: 0,
    degreeRotationX: -0.1,
    degreeRotationY: 0.12,
    degreeRotationZ: -0.08,
    degreeFloat: 0,
    sceneParallax: 0
}

const orderedLayouts = sections.map((section) => desktopLayouts[section.dataset.section] || desktopLayouts.home)

const pointer = {
    x: 0,
    y: 0
}

const target = {
    rotationX: 0,
    rotationY: 0,
    positionX: 0,
    positionY: 0,
    cameraX: 0,
    cameraY: 0,
    torusScale: 1,
    degreeTiltX: 0,
    degreeTiltY: 0
}

let currentTorusOpacity = mobileLayout.torusOpacity
let currentDegreeOpacity = mobileLayout.degreeOpacity

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
    target.torusScale = 1
    target.degreeTiltX = 0
    target.degreeTiltY = 0
}

const setPointer = (clientX, clientY) =>
{
    if(sizes.width <= 900)
    {
        resetInteraction()
        return
    }

    pointer.x = clientX / sizes.width - 0.5
    pointer.y = clientY / sizes.height - 0.5

    target.rotationY = pointer.x * 0.8
    target.rotationX = pointer.y * 0.42
    target.positionX = pointer.x * 0.14
    target.positionY = - pointer.y * 0.1
    target.cameraX = pointer.x * 0.05
    target.cameraY = - pointer.y * 0.04
    target.torusScale = 1 + (Math.abs(pointer.x) * 0.016 + Math.abs(pointer.y) * 0.012)
    target.degreeTiltX = -pointer.y * 0.12
    target.degreeTiltY = pointer.x * 0.18
}

const getPageScroll = () => window.scrollY || window.pageYOffset || 0

const getDesktopLayoutState = () =>
{
    const scrollY = getPageScroll()
    const sectionSnapOffset = 120
    const transitionLead = sizes.height * 0.42
    const transitionEndPadding = sectionSnapOffset + sizes.height * 0.05

    if(sections.length <= 1)
    {
        const singleLayout = orderedLayouts[0] || desktopLayouts.home

        return {
            current: singleLayout,
            next: singleLayout,
            progress: 0
        }
    }

    for(let i = 0; i < sections.length - 1; i++)
    {
        const nextSection = sections[i + 1]
        const currentLayout = orderedLayouts[i]
        const nextLayout = orderedLayouts[i + 1]
        const transitionStart = Math.max(nextSection.offsetTop - transitionLead, 0)
        const transitionEnd = Math.max(nextSection.offsetTop - transitionEndPadding, transitionStart + 1)

        if(scrollY < transitionStart)
        {
            return {
                current: currentLayout,
                next: currentLayout,
                progress: 0
            }
        }

        if(scrollY < transitionEnd)
        {
            return {
                current: currentLayout,
                next: nextLayout,
                progress: THREE.MathUtils.clamp(
                    (scrollY - transitionStart) / Math.max(transitionEnd - transitionStart, 1),
                    0,
                    1
                )
            }
        }
    }

    const finalLayout = orderedLayouts[orderedLayouts.length - 1] || desktopLayouts.home

    return {
        current: finalLayout,
        next: finalLayout,
        progress: 0
    }
}

const getLayoutConfig = () =>
{
    if(sizes.width <= 900)
    {
        return mobileLayout
    }

    const { current, next, progress } = getDesktopLayoutState()

    return {
        cameraZ: THREE.MathUtils.lerp(current.cameraZ, next.cameraZ, progress),
        torusX: THREE.MathUtils.lerp(current.torusX, next.torusX, progress),
        torusY: THREE.MathUtils.lerp(current.torusY, next.torusY, progress),
        torusScale: THREE.MathUtils.lerp(current.torusScale, next.torusScale, progress),
        torusOpacity: THREE.MathUtils.lerp(current.torusOpacity, next.torusOpacity, progress),
        torusRotationOffset: THREE.MathUtils.lerp(current.torusRotationOffset, next.torusRotationOffset, progress),
        torusFloat: THREE.MathUtils.lerp(current.torusFloat, next.torusFloat, progress),
        degreeX: THREE.MathUtils.lerp(current.degreeX, next.degreeX, progress),
        degreeY: THREE.MathUtils.lerp(current.degreeY, next.degreeY, progress),
        degreeScale: THREE.MathUtils.lerp(current.degreeScale, next.degreeScale, progress),
        degreeOpacity: THREE.MathUtils.lerp(current.degreeOpacity, next.degreeOpacity, progress),
        degreeRotationX: THREE.MathUtils.lerp(current.degreeRotationX, next.degreeRotationX, progress),
        degreeRotationY: THREE.MathUtils.lerp(current.degreeRotationY, next.degreeRotationY, progress),
        degreeRotationZ: THREE.MathUtils.lerp(current.degreeRotationZ, next.degreeRotationZ, progress),
        degreeFloat: THREE.MathUtils.lerp(current.degreeFloat, next.degreeFloat, progress),
        sceneParallax: THREE.MathUtils.lerp(current.sceneParallax, next.sceneParallax, progress)
    }
}

const updateLayout = () =>
{
    const layout = getLayoutConfig()

    camera.position.z = layout.cameraZ
    torusGroup.position.set(layout.torusX, layout.torusY, 0)
    torusGroup.scale.setScalar(layout.torusScale)
    degreeGroup.position.set(layout.degreeX, layout.degreeY, 0)
    degreeGroup.scale.setScalar(layout.degreeScale)
    degreeGroup.rotation.set(layout.degreeRotationX, layout.degreeRotationY, layout.degreeRotationZ)
}

const updateActiveSection = () =>
{
    const anchor = getPageScroll() + sizes.height * 0.38
    let activeSection = sections[0]?.dataset.section || 'home'

    for(const section of sections)
    {
        if(anchor >= section.offsetTop)
        {
            activeSection = section.dataset.section || activeSection
        }
    }

    pageLinks.forEach((link) =>
    {
        link.classList.toggle('is-active', link.dataset.section === activeSection)
    })
}

scrollLinks.forEach((link) =>
{
    const targetSelector = link.getAttribute('href')

    if(!targetSelector || !targetSelector.startsWith('#'))
    {
        return
    }

    link.addEventListener('click', (event) =>
    {
        const targetElement = document.querySelector(targetSelector)

        if(!targetElement)
        {
            return
        }

        event.preventDefault()
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        })
    })
})

updateLayout()
updateActiveSection()

window.addEventListener('resize', () =>
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    updateLayout()
    updateActiveSection()

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

window.addEventListener('scroll', updateActiveSection, { passive: true })

window.addEventListener('pointermove', (event) =>
{
    if(event.pointerType !== 'mouse')
    {
        return
    }

    setPointer(event.clientX, event.clientY)
})

window.addEventListener('pointerout', (event) =>
{
    if(event.relatedTarget === null)
    {
        resetInteraction()
    }
})

window.addEventListener('blur', resetInteraction)

const setTorusOpacity = (opacity) =>
{
    torusMaterial.opacity = opacity
    torusInnerMaterial.opacity = 0.16 * opacity
    torusGlowMaterial.opacity = 0.08 * opacity
}

const setDegreeOpacity = (opacity) =>
{
    degreeFrontMaterial.opacity = opacity
    degreeParchmentMaterial.opacity = opacity * 0.18
    degreeBackMaterial.opacity = opacity * 0.26
    degreeBorderMaterial.opacity = opacity * 0.14
    degreeShadowMaterial.opacity = opacity * 0.12
}

setTorusOpacity(currentTorusOpacity)
setDegreeOpacity(currentDegreeOpacity)

const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    const layout = getLayoutConfig()

    camera.position.z += (layout.cameraZ - camera.position.z) * 0.035

    currentTorusOpacity += (layout.torusOpacity - currentTorusOpacity) * 0.05
    currentDegreeOpacity += (layout.degreeOpacity - currentDegreeOpacity) * 0.05

    setTorusOpacity(currentTorusOpacity)
    setDegreeOpacity(currentDegreeOpacity)

    torusMesh.rotation.x += ((0.72 + target.rotationX) - torusMesh.rotation.x) * 0.022
    torusMesh.rotation.y += ((elapsedTime * 0.24 + layout.torusRotationOffset + target.rotationY) - torusMesh.rotation.y) * 0.022
    torusMesh.rotation.z += 0.0015

    torusGroup.position.x += ((layout.torusX + target.positionX) - torusGroup.position.x) * 0.03
    torusGroup.position.y += ((layout.torusY + target.positionY + Math.sin(elapsedTime * 1.1) * layout.torusFloat) - torusGroup.position.y) * 0.03

    const torusScaleTarget = layout.torusScale * target.torusScale
    torusGroup.scale.x += (torusScaleTarget - torusGroup.scale.x) * 0.05
    torusGroup.scale.y += (torusScaleTarget - torusGroup.scale.y) * 0.05
    torusGroup.scale.z += (torusScaleTarget - torusGroup.scale.z) * 0.05

    degreeGroup.position.x += ((layout.degreeX + target.positionX * 0.35) - degreeGroup.position.x) * 0.04
    degreeGroup.position.y += ((layout.degreeY + target.positionY * 0.35 + Math.sin(elapsedTime * 0.85) * layout.degreeFloat) - degreeGroup.position.y) * 0.04

    degreeGroup.scale.x += (layout.degreeScale - degreeGroup.scale.x) * 0.045
    degreeGroup.scale.y += (layout.degreeScale - degreeGroup.scale.y) * 0.045
    degreeGroup.scale.z += (layout.degreeScale - degreeGroup.scale.z) * 0.045

    degreeGroup.rotation.x += ((layout.degreeRotationX + target.degreeTiltX) - degreeGroup.rotation.x) * 0.04
    degreeGroup.rotation.y += ((layout.degreeRotationY + target.degreeTiltY) - degreeGroup.rotation.y) * 0.04
    degreeGroup.rotation.z += ((layout.degreeRotationZ - pointer.x * 0.04) - degreeGroup.rotation.z) * 0.04

    cameraGroup.position.x += ((target.cameraX * layout.sceneParallax) - cameraGroup.position.x) * 0.025
    cameraGroup.position.y += ((target.cameraY * layout.sceneParallax) - cameraGroup.position.y) * 0.025

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
