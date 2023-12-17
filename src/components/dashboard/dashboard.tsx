import { useEffect, useState } from 'react';
import styles from './../../../styles/dashboard.module.css';
import Cookies from 'js-cookie';
import router from 'next/router';
import {
  Table,
  ScrollArea,
  UnstyledButton,
  Group,
  Text,
  Center,
  TextInput,
  Button,
  Flex,
} from '@mantine/core';
import { keys } from '@mantine/utils';
import { IconSelector, IconChevronDown, IconChevronUp, IconSearch } from '@tabler/icons-react';
import useStyles from './style';
import { showNotification } from '@mantine/notifications';
import { bankAPI } from 'src/lib/bankAPI';
import { supplierAPI } from 'src/lib/supplierAPI';
import { eCommerceAPI } from 'src/lib/eCommerceAPI';
import { axios } from 'src/lib/axios';


function convertToBST(utcDateString : string) {
  const utcDate = new Date(utcDateString);
  
  // Convert to Bangladesh Standard Time (BST)
  const bstDate = new Date(utcDate.getTime());// + (6 * 60 * 60 * 1000)); // Add 6 hours for BST
  
  const year = bstDate.getFullYear();
  const month = String(bstDate.getMonth() + 1).padStart(2, '0');
  const day = String(bstDate.getDate()).padStart(2, '0');
  const hours24 = bstDate.getHours();
  const hours12 = hours24 % 12 || 12; // Convert to 12-hour format
  const minutes = String(bstDate.getMinutes()).padStart(2, '0');
  const seconds = String(bstDate.getSeconds()).padStart(2, '0');
  const ampm = hours24 < 12 ? 'AM' : 'PM';
  
  return `${year}-${month}-${day} ${hours12}:${minutes}:${seconds} ${ampm}`;
}

interface PendingOrder {
  id: number;
  user_email: string;
  time: string;
  status: number;
  cnt_p1: number;
  cnt_p2: number;
  cnt_p3: number;
  total: number;
}

interface PendingOrderTableProps {
  pendingOrders: PendingOrder[];
}

interface ThProps {
  children: React.ReactNode;
  reversed?: boolean;
  sorted?: boolean;
  onSort?(): void;
}

function Th({ children, reversed, sorted, onSort }: ThProps) {
  const { classes } = useStyles();
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <th className={classes.th}>
      {onSort ? (
        <UnstyledButton onClick={onSort} className={classes.control}>
          <Group position="apart">
            <Text fw={500} fz="sm">
              {children}
            </Text>
            <Center className={classes.icon}>
              <Icon size="0.9rem" stroke={1.5} />
            </Center>
          </Group>
        </UnstyledButton>
      ) : (
        <Text fw={500} fz="sm">
          {children}
        </Text>
      )}
    </th>
  );
}

function filterData(data: PendingOrder[], search: string) {
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    keys(item).some((key) => String(item[key]).toLowerCase().includes(query))
  );
}

function sortData(
  data: PendingOrder[],
  payload: { sortBy: keyof PendingOrder | null; reversed: boolean; search: string }
) {
  const { sortBy } = payload;

  if (!sortBy) {
    return filterData(data, payload.search);
  }

  return filterData(
    [...data].sort((a, b) => {
      if (payload.reversed) {
        return String(b[sortBy]).localeCompare(String(a[sortBy]));
      }

      return String(a[sortBy]).localeCompare(String(b[sortBy]));
    }),
    payload.search
  );
}

export default function DashboardPage() {
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState<PendingOrder[]>([]);
  const [sortBy, setSortBy] = useState<keyof PendingOrder | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const setSorting = (field: keyof PendingOrder) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(
      sortData(pendingOrders, {
        sortBy: field,
        reversed,
        search,
      })
    );
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(
      sortData(pendingOrders, {
        sortBy,
        reversed: reverseSortDirection,
        search: value,
      })
    );
  };

async function get_user_account(email: string): Promise<number> {
  try {
    const response = await axios.get(`/get-bank-info?email=${encodeURIComponent(email)}`);
    const bankInfo = response.data.bankInfo;

    if (bankInfo) {
      return bankInfo.account;
    } else {
      // Return a default acc_no if bankInfo is null
      return 2000;
    }
  } catch (error) {
    console.error('Error fetching bank info:', error);
    // Handle the error accordingly, e.g., show an error message
    return 2000;
  }
}


  const handleTransferMoney = async (fromAccNo: number, toAccNo: number, amount: number) => {
    try {
      const response = await axios.put('/updateBalance', {
        account_from : fromAccNo,
        account_to : toAccNo,
        tot : amount,
      });
  
      if (response.data.success) {
        console.log('Money transferred successfully');
        showNotification({
          title: "Money transferred successfully",
          message: "Successfully transferred money",
          color: "teal",
          autoClose: 5000,
       });
      } else {
        console.error('Error transferring money:', response.data.message);
        showNotification({
          title: 'Error ransferring money',
          message: response.data.message,
          color: 'red',
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error('Error transferring money:', error);
      showNotification({
        title: 'Error ransferring money',
        message: error as string,
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  const handleSupply = async (orderId: number, orderAmount: number) => {
    try {
      const response = await supplierAPI.post('/supply-order', { orderId });
      
      if (response.data.success) {
        showNotification({
          title: "Order supplied",
          message: "Successfully supplied order",
          color: "teal",
          autoClose: 5000,
       });

        console.log('Order supplied successfully');
        
        //call BankAPI to get money from admin to supplier
        handleTransferMoney(2000, 1000, orderAmount);
       setTimeout(()=>{
       // window.location.reload();
       }, 500);
        // Reload the page
      } else {

        console.error('Error supplying order:', response.data.message);
      }
    } catch (error) {
      console.error('Error supplying order:', error);
      showNotification({
        title: 'Error supplying order',
        message: error as string,
        color: 'red',
        autoClose: 5000,
      });
    }
  };

  const handleReject = async (orderId: number, orderAmount:number, email: string) => {
    try {
      const response = await axios.put(`/reject-order?orderId=${orderId}`);
  
      if (response.data.success) {
        showNotification({
          title: 'Order rejected',
          message: 'Order rejected successfully',
          color: 'red',
          autoClose: 5000,
        });
  
        console.log('Order rejected and deleted successfully');
        //call bank api get user's acc_no
        //const accNo = await getAccountNumber(email);
        //call shop api to get user's acc_no
        const accNo = await get_user_account(email);
        //call bank api to give money return from admin to user
        handleTransferMoney(2000, accNo, orderAmount);
        
        //window.location.reload(); // Reload the page
      } else {
        console.error('Error rejecting order:', response.data.message);
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      showNotification({
        title: 'Error rejecting order',
        message: error as string,
        color: 'red',
        autoClose: 5000,
      });
    }
  };
  

  const rows = sortedData.map((order) => (
    <tr key={order.id}>
      <td>{convertToBST(order.time)}</td>
      <td>{order.user_email}</td>
      <td>{order.cnt_p1}</td>
      <td>{order.cnt_p2}</td>
      <td>{order.cnt_p3}</td>
      <td>{order.total}</td>
      <td>
        <Flex gap="md"> 
        <Button color="green" onClick={() => handleSupply(order.id, order.total)} > Supply </Button>
        <Button color="red" onClick={() => handleReject(order.id, order.total, order.user_email)} > Reject </Button>
        </Flex>
        
      </td>
    </tr>
  ));

  useEffect(() => {
    //const isLoggedIn = Cookies.get('acc_no');
    const isLoggedIn = Cookies.get('email_supplier');
    if (!isLoggedIn) {
      router.push('./login');
    }
  }, []);

  useEffect(() => {
    supplierAPI
      .get('/get-orders', { params: { status: 1 } })
      .then((response) => {
        setPendingOrders(response.data.orders);
        setSortedData(
          sortData(response.data.orders, {
            sortBy,
            reversed: reverseSortDirection,
            search,
          })
        );
      })
      .catch((error) => console.error('Error fetching pending orders:', error));
  }, []);

  useEffect(() => {
    setSortedData(sortData(pendingOrders, { sortBy, reversed: reverseSortDirection, search }));
  }, [pendingOrders, sortBy, reverseSortDirection, search]);

  return (
    <div className={styles.container} style={{ marginTop: '-8%' }}>
      <main className={styles.main}>
        <h2>Pending Orders</h2>
        {pendingOrders.length === 0 ? (
          <div className={styles.warnCard}>No pending orders available.</div>
        ) : (
          <ScrollArea>

            <Table horizontalSpacing="md" verticalSpacing="xs" miw={700} sx={{ tableLayout: 'fixed' }} striped highlightOnHover withBorder>
              <thead>
                <tr>
                  <Th
                    sorted={sortBy === 'time'}
                    reversed={reverseSortDirection}
                    onSort={() => setSorting('time')}
                  >
                    Time
                  </Th>
                  <Th
                    sorted={sortBy === 'user_email'}
                    reversed={reverseSortDirection}
                    onSort={() => setSorting('user_email')}
                  >
                    Buyer
                  </Th>
                  <Th
                    sorted={sortBy === 'cnt_p1'}
                    reversed={reverseSortDirection}
                    onSort={() => setSorting('cnt_p1')}
                  >
                    Pixel 6a
                  </Th>
                  <Th
                    sorted={sortBy === 'cnt_p2'}
                    reversed={reverseSortDirection}
                    onSort={() => setSorting('cnt_p2')}
                  >
                    Pixel 6 pro
                  </Th>
                  <Th
                    sorted={sortBy === 'cnt_p3'}
                    reversed={reverseSortDirection}
                    onSort={() => setSorting('cnt_p3')}
                  >
                    Pixel 6
                  </Th>
                  <Th
                    sorted={sortBy === 'total'}
                    reversed={reverseSortDirection}
                    onSort={() => setSorting('total')}
                  >
                    Price
                  </Th>
                  <Th>Action</Th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows
                ) : (
                  <tr>
                    <td colSpan={6}>
                      <Text weight={500} align="center">
                        Nothing found
                      </Text>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </ScrollArea>
        )}
      </main>
    </div>
  );
}
