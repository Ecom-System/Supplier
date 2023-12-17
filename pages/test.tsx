import { useEffect, useState } from 'react';
import styles from './../styles/dashboard.module.css';
import { axios } from 'src/lib/axios';
import Cookies from 'js-cookie';
import router from 'next/router';
import {
  createStyles,
  Table,
  ScrollArea,
  UnstyledButton,
  Group,
  Text,
  Center,
  TextInput,
  rem,
  Button,
  Flex,
} from '@mantine/core';
import { keys } from '@mantine/utils';
import { IconSelector, IconChevronDown, IconChevronUp, IconSearch } from '@tabler/icons-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale} from 'chart.js';


import { Pie } from 'react-chartjs-2';
import { Line } from 'react-chartjs-2';

import { Order } from 'src/types';
import useStyles from 'src/components/supply/style';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, LineElement, ArcElement, Tooltip, Legend, CategoryScale);



interface SupplyOrder {
  id: number;
  user_email: string;
  time: string;
  status: number;
  cnt_p1: number;
  cnt_p2: number;
  cnt_p3: number;
  total: number;
}

interface SupplyOrderTableProps {
  supplyOrders: SupplyOrder[];
}

interface ThProps {
  children: React.ReactNode;
  reversed?: boolean;
  sorted?: boolean;
  onSort?(): void;
}


interface ProductData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
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

function filterData(data: SupplyOrder[], search: string) {
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    keys(item).some((key) => String(item[key]).toLowerCase().includes(query))
  );
}

function sortData(
  data: SupplyOrder[],
  payload: { sortBy: keyof SupplyOrder | null; reversed: boolean; search: string }
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

export default function SupplyPage() {
  const [supplyOrders, setSupplyOrders] = useState<SupplyOrder[]>([]);
  const [search, setSearch] = useState('');
  const [sortedData, setSortedData] = useState<SupplyOrder[]>([]);
  const [sortBy, setSortBy] = useState<keyof SupplyOrder | null>(null);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [lineChartData, setLineChartData] = useState<ProductData | null>(null);


  const setSorting = (field: keyof SupplyOrder) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(
      sortData(supplyOrders, {
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
      sortData(supplyOrders, {
        sortBy,
        reversed: reverseSortDirection,
        search: value,
      })
    );
  };

  const handleSupply = (orderId: number) => {
    // Handle supply action here
    console.log('Supply order with ID:', orderId);
  };

  const rows = sortedData.map((order) => (
    <tr key={order.id}>
      <td>{order.time}</td>
      <td>{order.user_email}</td>
      <td>{order.cnt_p1}</td>
      <td>{order.cnt_p2}</td>
      <td>{order.cnt_p3}</td>
      <td>{order.total}</td>
    </tr>
  ));

  useEffect(() => {
    const isLoggedIn = Cookies.get('acc_no');
    if (!isLoggedIn) {
      router.push('./login');
    }
  }, []);

  useEffect(() => {
    axios
      .get('/get-orders', { params: { status: 3 } })
      .then((response) => {
        setSupplyOrders(response.data.orders);
        setSortedData(
          sortData(response.data.orders, {
            sortBy,
            reversed: reverseSortDirection,
            search,
          })
        );
      })
      .catch((error) => console.error('Error fetching supply orders:', error));
  }, []);

  useEffect(() => {
    setSortedData(sortData(supplyOrders, { sortBy, reversed: reverseSortDirection, search }));
  }, [supplyOrders, sortBy, reverseSortDirection, search]);

  useEffect(() => {
    axios
      .get('/get-orders', { params: { status: 3 } })
      .then((response) => {
        const orders = response.data.orders;
        const productCounts = {
          cnt_p1: 0,
          cnt_p2: 0,
          cnt_p3: 0,
        };
  
        orders.forEach((order : Order) => {
          productCounts.cnt_p1 += order.cnt_p1;
          productCounts.cnt_p2 += order.cnt_p2;
          productCounts.cnt_p3 += order.cnt_p3;
        });
  
        setProductData({
          labels: ['Product 1', 'Product 2', 'Product 3'],
          datasets: [
            {
              label: 'Product Sales',
              data: [
                productCounts.cnt_p1,
                productCounts.cnt_p2,
                productCounts.cnt_p3,
              ],
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
              ],
              borderWidth: 1,
            },
          ],
        });
  
        const orderCountsByDate = {} as any;
        orders.forEach((order : Order) => {
          const date = order.time.split('T')[0]; // Extract date part
          if (orderCountsByDate[date]) {
            orderCountsByDate[date] += 1;
          } else {
            orderCountsByDate[date] = 1;
          }
        });
  
        const lineChartLabels = Object.keys(orderCountsByDate);
        const lineChartData = {
          labels: lineChartLabels,
          datasets: [
            {
              label: 'Orders',
              data: lineChartLabels.map((date) => orderCountsByDate[date]),
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        };
  
        setLineChartData(lineChartData as any);
      })
      .catch((error) => {
        console.error('Error fetching orders:', error);
      });
  }, []);
  
  return (
    <div className={styles.container} style={{ marginTop: '-8%' }}>

      <main className={styles.main}>
      <h2>Statistics</h2>
      {productData && (
        <div className={styles.chartContainer}>
          <Pie
            data={{
              datasets: productData.datasets,
              labels: productData.labels,
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
            }}
          />
        </div>
      )}
      {lineChartData && (
      <div className={styles.chartContainer}>
        <h2>Product Sales Over Time</h2>
        <Line
          data={lineChartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
          }}
        />
      </div>
)}
        <h2>Supplied Orders</h2>
        {supplyOrders.length === 0 ? (
          <div className={styles.warnCard}>No supply orders available.</div>
        ) : (
          <ScrollArea>
            <TextInput
              placeholder="Search by any field"
              mb="md"
              icon={<IconSearch size="0.9rem" stroke={1.5} />}
              value={search}
              onChange={handleSearchChange}
            />
            <Table
              horizontalSpacing="md"
              verticalSpacing="xs"
              miw={700}
              sx={{ tableLayout: 'fixed' }}
              striped
              highlightOnHover
              withBorder
            >
              <thead>
                <tr>
                  <Th sorted={sortBy === 'time'} reversed={reverseSortDirection} onSort={() => setSorting('time')}>
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
                    Product1 Quantity
                  </Th>
                  <Th
                    sorted={sortBy === 'cnt_p2'}
                    reversed={reverseSortDirection}
                    onSort={() => setSorting('cnt_p2')}
                  >
                    Product2 Quantity
                  </Th>
                  <Th
                    sorted={sortBy === 'cnt_p3'}
                    reversed={reverseSortDirection}
                    onSort={() => setSorting('cnt_p3')}
                  >
                    Product3 Quantity
                  </Th>
                  <Th
                    sorted={sortBy === 'total'}
                    reversed={reverseSortDirection}
                    onSort={() => setSorting('total')}
                  >
                    Total Amount
                  </Th>
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