import { useQuery } from "@tanstack/react-query";




const BASEURL = process.env.NEXT_PUBLIC_BASEURL;

const useAllEmployees = () => {

  const { data: allemployees = [], isLoading, refetch } = useQuery({
    queryKey: ['allemployees'],
    queryFn: async () => {
      const res = await fetch(`${BASEURL}/employees`);
      if (!res.ok) throw new Error("Failed to fetch employees");
      return res.json();
    }
  });

  return [allemployees, isLoading, refetch];
};

export default useAllEmployees;