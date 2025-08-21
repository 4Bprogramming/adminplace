import { useQuery } from '@tanstack/react-query';



const BASEURL = process.env.NEXT_PUBLIC_BASEURL;

const useSingleEmployeeData = (id) => {
  const isEnabled = !!id;


  const { data: singleEmployee = null, isLoading, refetch } = useQuery({
    queryKey: ['singleEmployee', id],
    queryFn: async () => {
      const res = await fetch(`${BASEURL}/employees/${id}`);
      if (!res.ok) throw new Error("Error fetching employee");
      return res.json();
    },
    enabled: isEnabled,
    staleTime: 1000 * 60, // opcional
  });

  return [singleEmployee, isLoading, refetch];
};

export default useSingleEmployeeData;