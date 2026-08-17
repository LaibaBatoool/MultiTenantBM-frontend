import { useEffect, useMemo, useState } from 'react';
import { Button, Table, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAccounts, type AccountRecord } from '../api/accounts';
import { useBusinessUnit } from '../context/BusinessUnitContext';

const { Title } = Typography;

export default function Accounts() {
    const { selectedBusinessUnit } = useBusinessUnit();
    const navigate = useNavigate();

    const [accounts, setAccounts] = useState<AccountRecord[]>([]);
    const [loading, setLoading] = useState(false);

    const loadAccounts = async () => {
        if (!selectedBusinessUnit?.id) {
            setAccounts([]);
            return;
        }

        setLoading(true);

        try {
            const accountList = await getAccounts(selectedBusinessUnit.id);
            setAccounts(accountList);
        } catch (error) {
            message.error('Failed to load Chart of Accounts.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAccounts();
    }, [selectedBusinessUnit]);

    const accountsById = useMemo(() => {
        const map = new Map<number, AccountRecord>();
        accounts.forEach((account) => map.set(account.id, account));
        return map;
    }, [accounts]);

    const getDepth = (account: AccountRecord): number => {
        let depth = 0;
        let current: AccountRecord | undefined = account;
        while (current?.parentAccountId) {
            current = accountsById.get(current.parentAccountId);
            depth += 1;
        }
        return depth;
    };

    const columns = [
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'Name',
            key: 'name',
            render: (_: unknown, record: AccountRecord) =>
                `${'— '.repeat(getDepth(record))}${record.name}`,
        },
        {
            title: 'Type',
            dataIndex: 'accountType',
            key: 'accountType',
        },
        {
            title: 'Group Account',
            dataIndex: 'isGroup',
            key: 'isGroup',
            render: (value: boolean) => (value ? 'Yes' : 'No'),
        },
        {
            title: 'Parent',
            key: 'parent',
            render: (_: unknown, record: AccountRecord) => {
                const parent = record.parentAccountId ? accountsById.get(record.parentAccountId) : null;
                return parent ? `${parent.code} - ${parent.name}` : '';
            },
        },
    ];

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                }}
            >
                <Title level={3} style={{ margin: 0 }}>
                    Chart of Accounts ({accounts.length})
                </Title>

                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('add')}>
                    Add New
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={accounts}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 15,
                    showSizeChanger: false,
                }}
            />
        </div>
    );
}