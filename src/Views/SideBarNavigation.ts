import NavigationTypes from "../Enums/NavigationTypes";
import UserRoles from "../Enums/UserRoles";
import INavigation from "../Intefaces/INavigation";
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreditScoreIcon from '@mui/icons-material/CreditScore';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import InsertCommentIcon from '@mui/icons-material/InsertComment';
import TollIcon from '@mui/icons-material/Toll';
import AddTaskIcon from '@mui/icons-material/AddTask';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ReplyIcon from '@mui/icons-material/Reply';
const SideBarNavigation: INavigation[] = [
    
    {
        Name: "Dashboard",
        Icon: DashboardIcon,
        roles:[UserRoles.ADMIN, UserRoles.USER, UserRoles.OTHER],
        type: NavigationTypes.LINK,
        active: true,
        link: "/",
        validator: async (user: any): Promise<boolean> => {
            return true;
        },
        action: async (user: any): Promise<void> => {

        }
    },
    {
        Name: "Users",
        Icon: PeopleAltIcon,
        roles: [UserRoles.ADMIN],
        type: NavigationTypes.LINK,
        active: true,
        link: "/list/tbl_user",
        validator: async (user: any): Promise<boolean> => {
            return true;
        },
        action: async (user: any): Promise<void> => {

        }
    },
    
    {
        Name: "Tickets",
        Icon: ListAltIcon,
        roles: [UserRoles.ADMIN],
        type: NavigationTypes.LINK,
        active: true,
        link: "/list/tbl_ticket",
        validator: async (user: any): Promise<boolean> => {
            return true;
        },
        action: async (user: any): Promise<void> => {

        }
    },
    {
        Name: "My Tickets",
        Icon: AddTaskIcon,
        roles: [ UserRoles.USER ],
        type: NavigationTypes.LINK,
        active: true,
        link: "/list/tbl_myticket",
        validator: async (user: any): Promise<boolean> => {
            return true;
        },
        action: async (user: any): Promise<void> => {

        }
    },
    // {
    //     Name: "Member",
    //     Icon: AccountBoxIcon,
    //     roles:[UserRoles.ADMIN, UserRoles.USER, UserRoles.OTHER],
    //     type: NavigationTypes.LINK,
    //     active: true,
    //     link: "/list/tbl_member",
    //     validator: async (user: any): Promise<boolean> => {
    //         return true;
    //     },
    //     action: async (user: any): Promise<void> => {

    //     }
    // },
  
    {
        Name: "Response",
        Icon: InsertCommentIcon,
        roles: [UserRoles.ADMIN],
        type: NavigationTypes.LINK,
        active: true,
        link: "/list/tbl_response",
        validator: async (user: any): Promise<boolean> => {
            return true;
        },
        action: async (user: any): Promise<void> => {

        }
    },
    {
        Name: "Response",
        Icon: ReplyIcon,
        roles: [UserRoles.USER],
        type: NavigationTypes.LINK,
        active: true,
        link: "/list/tbl_seeresponse",
        validator: async (user: any): Promise<boolean> => {
            return true;
        },
        action: async (user: any): Promise<void> => {

        }
    },
    
    
    
   

];

export default SideBarNavigation;