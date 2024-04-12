'use client';

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MdDashboard,
  MdContacts,
  MdDateRange,
  MdMenuBook,
  MdLogout,
  MdOutlineTopic,
  MdAttachMoney,
  MdOutlinePayments,
  MdOutlineArrowCircleLeft,
  MdOutlineArrowCircleRight
} from "react-icons/md";

import styles from "./MainMenu.module.scss";
import menuItemStyles from "./MenuItem.module.scss";
import menuGroupStyles from "./MenuGroup.module.scss";
import { logout } from "@/actions/user/logout";
import { MenuItem } from "./MenuItem";
import { MenuGroup } from "./MenuGroup";

const MainMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className={`${styles.mainNav} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.nameContainer}>
       { isOpen && <Link href="/" className={styles.name}>Calendar Planner</Link>}
        <Image
          src="/images/logo.png"
          alt="Calendar Planner Logo"
          width={50}
          height={50}
        />
       {isOpen ? <MdOutlineArrowCircleLeft  className={styles.arrow} onClick={() => setIsOpen(false)}/> : <MdOutlineArrowCircleRight className={styles.arrow} onClick={() => setIsOpen(true)}/>}
      </div>
      {isOpen && 
      <ul className={styles.navList}>
        <li>
          <MenuGroup title="Pages">
            <MenuItem
              icon={MdDashboard}
              label="Dashboard"
              urlPath="/dashboard"
            />
            <MenuItem
              icon={MdOutlinePayments}
              label="Payments"
              urlPath="/dashboard/payments"
            />
            <MenuItem
              icon={MdAttachMoney}
              label="Purchases"
              urlPath="/dashboard/purchases"
            />
            <MenuItem
              icon={MdMenuBook}
              label="Address Books"
              urlPath="/dashboard/address-books"
            />
            <MenuItem
              icon={MdContacts}
              label="Contacts"
              urlPath="/dashboard/contacts"
            />
            <MenuItem
              icon={MdOutlineTopic}
              label="Advertisement Types"
              urlPath="/dashboard/advertisement-types"
            />
            <MenuItem
              icon={MdDateRange}
              label="Calendar Editions"
              urlPath="/dashboard/calendar-editions"
            />
          </MenuGroup>
        </li>
        <li>
          <MenuGroup title="User">
            <form className={menuGroupStyles.menuGroup} action={logout}>
              <button
                type="submit"
                className={`${menuItemStyles.label} ${styles.logoutButton}`}
              >
                <div className={menuItemStyles.item}>
                  <p className={menuItemStyles.icon}>
                    <MdLogout />
                  </p>
                  <span className={menuItemStyles.label}>Sign Out</span>
                </div>
              </button>
            </form>
          </MenuGroup>
        </li>
      </ul>}
    </nav>
  );
};

export default MainMenu;
