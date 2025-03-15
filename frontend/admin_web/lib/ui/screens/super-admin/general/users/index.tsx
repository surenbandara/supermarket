// Core

// Components
import UserHeader from '@/lib/ui/screen-components/protected/super-admin/users/view/header/screen-header';
import UserMain from '@/lib/ui/screen-components/protected/super-admin/users/view/main';

// Interfaces and Types

export default function Screen() {

  return (
    <div className="screen-container">
      <UserHeader/>

      <UserMain />
    </div>
  );
}
