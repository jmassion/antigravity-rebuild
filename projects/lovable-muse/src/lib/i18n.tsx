import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export type Locale = 'en' | 'es';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Sidebar nav
    'nav.dashboard': 'Dashboard',
    'nav.allProjects': 'All Projects',
    'nav.uploads': 'Uploads',
    'nav.tasks': 'Tasks',
    'nav.team': 'Team',
    'nav.adminRoles': 'Admin: Roles',
    'nav.docs': 'Docs',
    'nav.settings': 'Settings',
    'nav.canvas': 'Canvas',
    'nav.signOut': 'Sign out',
    'nav.search': 'Search...',

    // Phases
    'phase.start': 'START',
    'phase.build': 'BUILD',
    'phase.grow': 'GROW',

    // Phase items
    'nav.characters': 'Characters',
    'nav.styleGuides': 'Style Guides',
    'nav.worldsProps': 'Worlds & Props',
    'nav.prompts': 'Prompts',
    'nav.storyboards': 'Storyboards',
    'nav.plans': 'Plans',
    'nav.assetLibrary': 'Asset Library',
    'nav.timeline': 'Timeline',
    'nav.connections': 'Connections',
    'nav.provenance': 'Provenance',
    'nav.linksTools': 'Links & Tools',
    'nav.campaigns': 'Campaigns',
    'nav.marketingAssets': 'Marketing Assets',

    // Dashboard / Index
    'dashboard.title': 'Production',
    'dashboard.titleHighlight': 'Pipeline',
    'dashboard.subtitle': 'From concept to campaign. Manage your entire creative workflow in one place.',
    'dashboard.start.desc': 'Characters, style guides, worlds, prompts',
    'dashboard.build.desc': 'Storyboards, timelines, asset arrangement',
    'dashboard.grow.desc': 'Marketing, campaigns, launch materials',
    'dashboard.explore': 'Explore',
    'dashboard.recentProjects': 'Recent Projects',
    'dashboard.viewAll': 'View All',
    'dashboard.noProjects': 'No projects yet —',
    'dashboard.createOne': 'create one',
    'dashboard.recentAssets': 'Recent Assets',
    'dashboard.projects': 'projects',

    // Auth
    'auth.createAccount': 'Create account',
    'auth.signIn': 'Sign in',
    'auth.signUp': 'Sign up',
    'auth.displayName': 'Display name',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.checkEmail': 'Check your email',
    'auth.confirmLink': 'We sent you a confirmation link.',
    'auth.hasAccount': 'Already have an account? Sign in',
    'auth.noAccount': "Don't have an account? Sign up",

    // Assets
    'assets.title': 'Asset Library',
    'assets.upload': 'Upload',
    'assets.bulkAttach': 'Bulk Attach',
    'assets.searchPlaceholder': 'Search assets by name, tag, or description...',
    'assets.count': 'Assets',

    // Tasks
    'tasks.title': 'Tasks',
    'tasks.subtitle': 'Track work across projects, assets, and storyboards',
    'tasks.newTask': 'New Task',
    'tasks.createTask': 'Create Task',
    'tasks.taskTitle': 'Task title',
    'tasks.description': 'Description (optional)',
    'tasks.taskCreated': 'Task created',
    'tasks.taskDeleted': 'Task deleted',

    // Status labels
    'status.todo': 'To Do',
    'status.inProgress': 'In Progress',
    'status.review': 'Review',
    'status.done': 'Done',
    'status.draft': 'Draft',
    'status.active': 'Active',
    'status.complete': 'Complete',

    // Priority labels
    'priority.low': 'Low',
    'priority.medium': 'Medium',
    'priority.high': 'High',
    'priority.urgent': 'Urgent',

    // Team
    'team.title': 'Team',
    'team.subtitle': 'Manage humans, AI agents, and placeholder roles',
    'team.newMember': 'New Member',
    'team.editMember': 'Edit Member',
    'team.newTeamMember': 'New Team Member',
    'team.memberCreated': 'Member created',
    'team.memberUpdated': 'Member updated',
    'team.memberRemoved': 'Member removed',
    'team.noMembers': 'No team members found',
    'team.assignToProjects': 'Assign to projects',
    'team.noProjects': 'No projects yet',

    // Projects
    'projects.title': 'All Projects',
    'projects.newProject': 'New Project',
    'projects.projectCreated': 'Project created',
    'projects.projectDeleted': 'Project deleted',
    'projects.projectMoved': 'Project moved',
    'projects.noProjects': 'No projects yet — create one above',
    'projects.export': 'Export',
    'projects.move': 'Move',
    'projects.delete': 'Delete',

    // Storyboards
    'storyboards.title': 'Storyboards',
    'storyboards.subtitle': 'Arrange and sequence your frames',
    'storyboards.newStoryboard': 'New Storyboard',
    'storyboards.storyboardCreated': 'Storyboard created',
    'storyboards.noStoryboards': 'No storyboards yet — create one above',

    // Plans
    'plans.title': 'Plans',
    'plans.subtitle': 'Map prompts to structured plans and track deliverables',
    'plans.newPlan': 'New Plan',
    'plans.createPlan': 'Create Plan',
    'plans.planCreated': 'Plan created',
    'plans.planDeleted': 'Plan deleted',
    'plans.noPlans': 'No plans yet — create one above',
    'plans.linkItems': 'Link items',
    'plans.goals': 'Goals',

    // Links
    'links.title': 'Links & Tools',
    'links.addLink': 'Add Link',
    'links.editLink': 'Edit Link',
    'links.addNewLink': 'Add New Link',
    'links.linkAdded': 'Link added',
    'links.linkUpdated': 'Link updated',
    'links.linkDeleted': 'Link deleted',
    'links.noLinks': 'No links yet. Add your first external link or tool.',
    'links.noMatch': 'No links match your filters.',
    'links.searchPlaceholder': 'Search links...',

    // Uploads
    'uploads.title': 'Upload History',
    'uploads.uploadFiles': 'Upload Files',
    'uploads.searchPlaceholder': 'Search uploads...',
    'uploads.noUploads': 'No uploads yet — upload files above',
    'uploads.noMatch': 'No uploads match your search',

    // Connections
    'connections.title': 'Connections',
    'connections.filterNodes': 'Filter nodes...',
    'connections.noData': 'No data to visualize yet',

    // Provenance
    'provenance.title': 'Provenance',
    'provenance.subtitle': 'Trace how prompts flow through plans into derived items',
    'provenance.noLinks': 'No provenance links yet',
    'provenance.noLinksHint': 'Create plans and link them to prompts and deliverables to see the flow',

    // Docs
    'docs.title': 'Docs',
    'docs.searchDocs': 'Search docs...',
    'docs.newDocument': 'New Document',
    'docs.noDocuments': 'No documents found',

    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.displayName': 'Display Name',
    'settings.email': 'Email',
    'settings.saveChanges': 'Save Changes',
    'settings.profileUpdated': 'Profile updated',
    'settings.account': 'Account',
    'settings.userId': 'User ID',
    'settings.joined': 'Joined',
    'settings.exportAll': 'Export All Data',
    'settings.exportDesc': 'Download all your project data as organized JSON. Choose projects, filter by tags, and select flat or hierarchical export.',
    'settings.exportData': 'Export Data',
    'settings.clickToChange': 'Click to change',
    'settings.language': 'Language',
    'settings.languageDesc': 'Choose your preferred display language.',

    // Phase sub-pages
    'characters.title': 'Characters',
    'characters.desc': 'Character profiles with custom fields, galleries, and notes',
    'characters.newCharacter': 'New Character',
    'characters.noCharacters': 'No characters yet — create one to get started',
    'characters.status.concept': 'Concept',
    'characters.status.in_progress': 'In Progress',
    'characters.status.approved': 'Approved',
    'characters.status.archived': 'Archived',
    'styleGuides.title': 'Style Guides',
    'styleGuides.desc': 'Color palettes, typography, visual language, and mood boards',
    'worlds.title': 'Worlds & Props',
    'worlds.desc': 'Environments, backgrounds, props, and scene elements',
    'prompts.title': 'Prompts',
    'prompts.desc': 'AI prompts, generation templates, and prompt libraries',
    'campaigns.title': 'Campaigns',
    'campaigns.desc': 'Marketing campaigns, launch plans, and promotional content',
    'marketingAssets.title': 'Marketing Assets',
    'marketingAssets.desc': 'Social media graphics, banners, thumbnails, and promotional materials',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.create': 'Create',
    'common.update': 'Update',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.all': 'All',
    'common.noProject': 'No Project',

    // Export dialog
    'export.title': 'Export Project Data',
    'export.format': 'Format',
    'export.structure': 'Structure',
    'export.flat': 'Flat',
    'export.organized': 'Organized',
    'export.projects': 'Projects',
    'export.selectAll': 'Select all',
    'export.clear': 'Clear',
    'export.include': 'Include',
    'export.tagFilter': 'Tag Filter (optional)',
    'export.tagHint': 'Comma separated. Only items matching these tags will be exported.',
    'export.selected': 'selected',
    'export.complete': 'Export complete',
    'export.completeDesc': 'Your project data has been downloaded',
    'export.failed': 'Export failed',
  },
  es: {
    // Sidebar nav
    'nav.dashboard': 'Panel',
    'nav.allProjects': 'Proyectos',
    'nav.uploads': 'Subidas',
    'nav.tasks': 'Tareas',
    'nav.team': 'Equipo',
    'nav.adminRoles': 'Admin: Roles',
    'nav.docs': 'Documentos',
    'nav.settings': 'Ajustes',
    'nav.canvas': 'Lienzo',
    'nav.signOut': 'Cerrar sesión',
    'nav.search': 'Buscar...',

    // Phases
    'phase.start': 'INICIO',
    'phase.build': 'CREAR',
    'phase.grow': 'CRECER',

    // Phase items
    'nav.characters': 'Personajes',
    'nav.styleGuides': 'Guías de Estilo',
    'nav.worldsProps': 'Mundos y Props',
    'nav.prompts': 'Prompts',
    'nav.storyboards': 'Storyboards',
    'nav.plans': 'Planes',
    'nav.assetLibrary': 'Biblioteca de Assets',
    'nav.timeline': 'Línea de Tiempo',
    'nav.connections': 'Conexiones',
    'nav.provenance': 'Procedencia',
    'nav.linksTools': 'Enlaces y Herramientas',
    'nav.campaigns': 'Campañas',
    'nav.marketingAssets': 'Assets de Marketing',

    // Dashboard / Index
    'dashboard.title': 'Producción',
    'dashboard.titleHighlight': 'Pipeline',
    'dashboard.subtitle': 'Del concepto a la campaña. Gestiona todo tu flujo creativo en un solo lugar.',
    'dashboard.start.desc': 'Personajes, guías de estilo, mundos, prompts',
    'dashboard.build.desc': 'Storyboards, líneas de tiempo, organización de assets',
    'dashboard.grow.desc': 'Marketing, campañas, materiales de lanzamiento',
    'dashboard.explore': 'Explorar',
    'dashboard.recentProjects': 'Proyectos Recientes',
    'dashboard.viewAll': 'Ver Todo',
    'dashboard.noProjects': 'Aún no hay proyectos —',
    'dashboard.createOne': 'crear uno',
    'dashboard.recentAssets': 'Assets Recientes',
    'dashboard.projects': 'proyectos',

    // Auth
    'auth.createAccount': 'Crear cuenta',
    'auth.signIn': 'Iniciar sesión',
    'auth.signUp': 'Registrarse',
    'auth.displayName': 'Nombre para mostrar',
    'auth.email': 'Correo electrónico',
    'auth.password': 'Contraseña',
    'auth.checkEmail': 'Revisa tu correo',
    'auth.confirmLink': 'Te enviamos un enlace de confirmación.',
    'auth.hasAccount': '¿Ya tienes cuenta? Inicia sesión',
    'auth.noAccount': '¿No tienes cuenta? Regístrate',

    // Assets
    'assets.title': 'Biblioteca de Assets',
    'assets.upload': 'Subir',
    'assets.bulkAttach': 'Vincular en Lote',
    'assets.searchPlaceholder': 'Buscar assets por nombre, etiqueta o descripción...',
    'assets.count': 'Assets',

    // Tasks
    'tasks.title': 'Tareas',
    'tasks.subtitle': 'Seguimiento del trabajo en proyectos, assets y storyboards',
    'tasks.newTask': 'Nueva Tarea',
    'tasks.createTask': 'Crear Tarea',
    'tasks.taskTitle': 'Título de la tarea',
    'tasks.description': 'Descripción (opcional)',
    'tasks.taskCreated': 'Tarea creada',
    'tasks.taskDeleted': 'Tarea eliminada',

    // Status labels
    'status.todo': 'Por Hacer',
    'status.inProgress': 'En Progreso',
    'status.review': 'Revisión',
    'status.done': 'Hecho',
    'status.draft': 'Borrador',
    'status.active': 'Activo',
    'status.complete': 'Completo',

    // Priority labels
    'priority.low': 'Baja',
    'priority.medium': 'Media',
    'priority.high': 'Alta',
    'priority.urgent': 'Urgente',

    // Team
    'team.title': 'Equipo',
    'team.subtitle': 'Gestiona humanos, agentes de IA y roles placeholder',
    'team.newMember': 'Nuevo Miembro',
    'team.editMember': 'Editar Miembro',
    'team.newTeamMember': 'Nuevo Miembro del Equipo',
    'team.memberCreated': 'Miembro creado',
    'team.memberUpdated': 'Miembro actualizado',
    'team.memberRemoved': 'Miembro eliminado',
    'team.noMembers': 'No se encontraron miembros',
    'team.assignToProjects': 'Asignar a proyectos',
    'team.noProjects': 'Aún no hay proyectos',

    // Projects
    'projects.title': 'Todos los Proyectos',
    'projects.newProject': 'Nuevo Proyecto',
    'projects.projectCreated': 'Proyecto creado',
    'projects.projectDeleted': 'Proyecto eliminado',
    'projects.projectMoved': 'Proyecto movido',
    'projects.noProjects': 'Aún no hay proyectos — crea uno arriba',
    'projects.export': 'Exportar',
    'projects.move': 'Mover',
    'projects.delete': 'Eliminar',

    // Storyboards
    'storyboards.title': 'Storyboards',
    'storyboards.subtitle': 'Organiza y secuencia tus fotogramas',
    'storyboards.newStoryboard': 'Nuevo Storyboard',
    'storyboards.storyboardCreated': 'Storyboard creado',
    'storyboards.noStoryboards': 'Aún no hay storyboards — crea uno arriba',

    // Plans
    'plans.title': 'Planes',
    'plans.subtitle': 'Vincula prompts a planes estructurados y haz seguimiento de entregables',
    'plans.newPlan': 'Nuevo Plan',
    'plans.createPlan': 'Crear Plan',
    'plans.planCreated': 'Plan creado',
    'plans.planDeleted': 'Plan eliminado',
    'plans.noPlans': 'Aún no hay planes — crea uno arriba',
    'plans.linkItems': 'Vincular elementos',
    'plans.goals': 'Objetivos',

    // Links
    'links.title': 'Enlaces y Herramientas',
    'links.addLink': 'Agregar Enlace',
    'links.editLink': 'Editar Enlace',
    'links.addNewLink': 'Agregar Nuevo Enlace',
    'links.linkAdded': 'Enlace agregado',
    'links.linkUpdated': 'Enlace actualizado',
    'links.linkDeleted': 'Enlace eliminado',
    'links.noLinks': 'Aún no hay enlaces. Agrega tu primer enlace externo o herramienta.',
    'links.noMatch': 'Ningún enlace coincide con tus filtros.',
    'links.searchPlaceholder': 'Buscar enlaces...',

    // Uploads
    'uploads.title': 'Historial de Subidas',
    'uploads.uploadFiles': 'Subir Archivos',
    'uploads.searchPlaceholder': 'Buscar subidas...',
    'uploads.noUploads': 'Aún no hay subidas — sube archivos arriba',
    'uploads.noMatch': 'Ninguna subida coincide con tu búsqueda',

    // Connections
    'connections.title': 'Conexiones',
    'connections.filterNodes': 'Filtrar nodos...',
    'connections.noData': 'Aún no hay datos para visualizar',

    // Provenance
    'provenance.title': 'Procedencia',
    'provenance.subtitle': 'Rastrea cómo los prompts fluyen a través de planes hacia elementos derivados',
    'provenance.noLinks': 'Aún no hay enlaces de procedencia',
    'provenance.noLinksHint': 'Crea planes y vincúlalos a prompts y entregables para ver el flujo',

    // Docs
    'docs.title': 'Documentos',
    'docs.searchDocs': 'Buscar documentos...',
    'docs.newDocument': 'Nuevo Documento',
    'docs.noDocuments': 'No se encontraron documentos',

    // Settings
    'settings.title': 'Ajustes',
    'settings.profile': 'Perfil',
    'settings.displayName': 'Nombre para Mostrar',
    'settings.email': 'Correo Electrónico',
    'settings.saveChanges': 'Guardar Cambios',
    'settings.profileUpdated': 'Perfil actualizado',
    'settings.account': 'Cuenta',
    'settings.userId': 'ID de Usuario',
    'settings.joined': 'Registrado',
    'settings.exportAll': 'Exportar Todos los Datos',
    'settings.exportDesc': 'Descarga todos tus datos de proyecto como JSON organizado. Elige proyectos, filtra por etiquetas y selecciona exportación plana o jerárquica.',
    'settings.exportData': 'Exportar Datos',
    'settings.clickToChange': 'Clic para cambiar',
    'settings.language': 'Idioma',
    'settings.languageDesc': 'Elige tu idioma de visualización preferido.',

    // Phase sub-pages
    'characters.title': 'Personajes',
    'characters.desc': 'Perfiles de personajes con campos personalizados, galerías y notas',
    'characters.newCharacter': 'Nuevo Personaje',
    'characters.noCharacters': 'Aún no hay personajes — crea uno para empezar',
    'characters.status.concept': 'Concepto',
    'characters.status.in_progress': 'En Progreso',
    'characters.status.approved': 'Aprobado',
    'characters.status.archived': 'Archivado',
    'styleGuides.title': 'Guías de Estilo',
    'styleGuides.desc': 'Paletas de colores, tipografía, lenguaje visual y tableros de inspiración',
    'worlds.title': 'Mundos y Props',
    'worlds.desc': 'Entornos, fondos, props y elementos de escena',
    'prompts.title': 'Prompts',
    'prompts.desc': 'Prompts de IA, plantillas de generación y bibliotecas de prompts',
    'campaigns.title': 'Campañas',
    'campaigns.desc': 'Campañas de marketing, planes de lanzamiento y contenido promocional',
    'marketingAssets.title': 'Assets de Marketing',
    'marketingAssets.desc': 'Gráficos para redes sociales, banners, miniaturas y materiales promocionales',

    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.create': 'Crear',
    'common.update': 'Actualizar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.search': 'Buscar',
    'common.all': 'Todo',
    'common.noProject': 'Sin Proyecto',

    // Export dialog
    'export.title': 'Exportar Datos del Proyecto',
    'export.format': 'Formato',
    'export.structure': 'Estructura',
    'export.flat': 'Plano',
    'export.organized': 'Organizado',
    'export.projects': 'Proyectos',
    'export.selectAll': 'Seleccionar todo',
    'export.clear': 'Limpiar',
    'export.include': 'Incluir',
    'export.tagFilter': 'Filtro de Etiquetas (opcional)',
    'export.tagHint': 'Separadas por comas. Solo se exportarán elementos con estas etiquetas.',
    'export.selected': 'seleccionados',
    'export.complete': 'Exportación completa',
    'export.completeDesc': 'Tus datos de proyecto han sido descargados',
    'export.failed': 'Exportación fallida',
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem('pipeline-locale');
    if (saved === 'es') return 'es';
    // Auto-detect browser language
    const browserLang = navigator.language.slice(0, 2);
    return browserLang === 'es' ? 'es' : 'en';
  });

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('pipeline-locale', l);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = useCallback((key: string): string => {
    return translations[locale]?.[key] || translations.en[key] || key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export const AVAILABLE_LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];
