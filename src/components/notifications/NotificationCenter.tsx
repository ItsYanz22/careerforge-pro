/**
 * NotificationCenter — re-exports the NotificationsDropdown.
 * The Navbar imports this component; keeping the file avoids changing
 * every import site while using the correct Zustand-based implementation.
 */
export { NotificationsDropdown as default } from '../ui/notifications-dropdown';
