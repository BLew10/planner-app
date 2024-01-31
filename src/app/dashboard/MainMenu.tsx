import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MdDashboard,
  MdContacts,
  MdAdd,
  MdMenuBook,
  MdLogout,
} from "react-icons/md";

import styles from "./MainMenu.module.scss";
import menuItemStyles from "./MenuItem.module.scss";
import menuGroupStyles from "./MenuGroup.module.scss";
import { logout } from "@/actions/user/logout";
import { MenuItem } from "./MenuItem";
import { MenuGroup } from "./MenuGroup";

const MainMenu = () => {
  return (
    <nav className={styles.mainNav}>
      <div className={styles.nameContainer}>
        <Link href="/dashboard">Calendar Planner</Link>
        <Image
          src="/images/logo.png"
          alt="Calendar Planner Logo"
          width={50}
          height={50}
        />
      </div>
      <ul className={styles.navList}>
        <li>
          <MenuGroup title="Pages">
            <MenuItem
              icon={MdDashboard}
              label="Dashboard"
              urlPath="/dashboard"
            />
          </MenuGroup>
        </li>
        <li>
          <MenuGroup title="Address Books">
            <MenuItem
              icon={MdMenuBook}
              label="View Address Books"
              urlPath="/dashboard/address-books"
            />
            <MenuItem
              icon={MdAdd}
              label="Add Address Book"
              urlPath="/dashboard/address-books/add"
            />
          </MenuGroup>
        </li>
        <li>
          <MenuGroup title="Contacts">
            <MenuItem
              icon={MdContacts}
              label="View Contacts"
              urlPath="/dashboard/contacts"
            />
            <MenuItem
              icon={MdAdd}
              label="Add Contact"
              urlPath="/dashboard/contacts/add"
            />
          </MenuGroup>
        </li>
        <li>
          <MenuGroup title="User">
            <form className={menuGroupStyles.menuGroup} action={logout}>
              <div className={menuItemStyles.item}>
                <p className={menuItemStyles.icon}>
                  <MdLogout />
                </p>
                <button type="submit" className={menuItemStyles.label}>
                  Sign Out
                </button>
              </div>
            </form>
          </MenuGroup>
        </li>
      </ul>
    </nav>
  );
};

export default MainMenu;
