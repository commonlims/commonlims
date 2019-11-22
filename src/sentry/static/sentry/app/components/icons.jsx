import React from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faVial,
  faClipboardList,
  faUserCog,
  faStar,
  faFolder,
  faFolderOpen,
  faHistory,
  faChartBar,
  faCog,
  faExclamationCircle,
  faQuestionCircle,
  faChevronCircleRight,
  faChevronCircleLeft,
} from '@fortawesome/free-solid-svg-icons';

export const Substance = () => <FontAwesomeIcon icon={faVial} />;
export const Projects = () => <FontAwesomeIcon icon={faClipboardList} />;
export const AssignedToMe = () => <FontAwesomeIcon icon={faUserCog} />;
export const Bookmarks = () => <FontAwesomeIcon icon={faStar} />;
export const AvailableWork = () => <FontAwesomeIcon icon={faFolder} />;
export const WorkInProgress = () => <FontAwesomeIcon icon={faFolderOpen} />;
export const RecentlyViewed = () => <FontAwesomeIcon icon={faHistory} />;
export const Stats = () => <FontAwesomeIcon icon={faChartBar} />;
export const Settings = () => <FontAwesomeIcon icon={faCog} />;
export const Activity = () => <FontAwesomeIcon icon={faExclamationCircle} />;
export const Help = () => <FontAwesomeIcon icon={faQuestionCircle} />;
export const CollapseLeftSidebar = () => <FontAwesomeIcon icon={faChevronCircleLeft} />;
export const ExpandLeftSidebar = () => <FontAwesomeIcon icon={faChevronCircleRight} />;
