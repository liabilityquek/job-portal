import Link from "next/link";

export const NavBar = () => {
  return (
    <div className="flex justify-between navbar bg-base-100">
      <div className="flex navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">

          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><a>Switch To Employer</a></li>
            <li>
              <a>Parent</a>
              <ul className="p-2">
                <li><a>Submenu 1</a></li>
                <li><a>Submenu 2</a></li>
              </ul>
            </li>
            <li><a>Item 3</a></li>
          </ul>
        </div>
        <a className="btn btn-ghost normal-case text-xl">HAR ORA</a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="flex menu menu-horizontal px-1">
          <li><a>Item 1</a></li>
          <li tabIndex={0}>
            <details>
              <summary>Parent</summary>
              <ul className="p-2">
                <li><a>Submenu 1</a></li>
                <li><a>Submenu 2</a></li>
              </ul>
            </details>
          </li>
          <li><a>Item 3</a></li>
        </ul>
      </div>
      <div className="navbar-end">
        <a className="btn">Login</a>
      </div>
    </div>
  );
};
