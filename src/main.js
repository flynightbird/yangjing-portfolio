import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/print.css';
import { initNavigation } from './ui/navigation.js';
import { initLightbox } from './ui/lightbox.js';
import { initPrint } from './ui/print.js';

initNavigation();
initLightbox();
initPrint();
